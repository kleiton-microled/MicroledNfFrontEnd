import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, firstValueFrom } from 'rxjs';

import { NfseApiService } from '../../../data-access/services/nfse-api.service';
import {
  NfseApiError,
  NotaFiscalEventoItem,
  NotaFiscalFilter,
  NotaFiscalItemResponse,
  ProcessarRpsResponse,
} from '../../../data-access/models/nfse-api.models';

@Injectable()
export class ListaNotasFiscaisFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _items = signal<NotaFiscalItemResponse[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _currentPage = signal(1);
  private readonly _totalPages = signal(0);
  private readonly _totalCount = signal(0);
  private readonly _pageSize = signal(20);
  private readonly _isProcessingPending = signal(false);
  private readonly _processPendingMessage = signal<string | null>(null);
  /** Erros do ultimo envio feito nesta tela, por id da nota (inclui falhas de comunicacao). */
  private readonly _sendErrors = signal<Record<string, NotaFiscalEventoItem[]>>({});
  private readonly _sendingId = signal<string | null>(null);
  private _lastFilter: NotaFiscalFilter = {};

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly isProcessingPending = this._isProcessingPending.asReadonly();
  readonly processPendingMessage = this._processPendingMessage.asReadonly();
  readonly sendErrors = this._sendErrors.asReadonly();
  readonly sendingId = this._sendingId.asReadonly();

  readonly hasItems = computed(() => this._items().length > 0);
  readonly isEmpty = computed(() => !this._isLoading() && !this._errorMessage() && this._items().length === 0);
  readonly hasPreviousPage = computed(() => this._currentPage() > 1);
  readonly hasNextPage = computed(() => this._currentPage() < this._totalPages());

  loadPage(filter: NotaFiscalFilter = {}): void {
    this._lastFilter = { ...filter };
    const pageFilter: NotaFiscalFilter = {
      ...filter,
      page: this._currentPage(),
      pageSize: this._pageSize(),
    };

    this._isLoading.set(true);
    this._errorMessage.set(null);

    this.nfseApiService
      .searchNotasFiscais(pageFilter)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this._items.set(response.items ?? []);
          this._totalCount.set(response.totalCount ?? 0);
          this._totalPages.set(response.totalPages ?? 0);
        },
        error: (error: unknown) => {
          this._items.set([]);
          this._totalCount.set(0);
          this._totalPages.set(0);
          this._errorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    this._currentPage.update((page) => page + 1);
    this.loadPage(this._lastFilter);
  }

  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    this._currentPage.update((page) => page - 1);
    this.loadPage(this._lastFilter);
  }

  async processPendingRps(): Promise<void> {
    if (this._isProcessingPending()) {
      return;
    }

    this._isProcessingPending.set(true);
    this._processPendingMessage.set(null);
    let sent = 0;
    let failed = 0;

    try {
      const pending = await this.loadAllByStatus('Pending');
      if (pending.length === 0) {
        this._processPendingMessage.set('Nao ha RPS com status A processar.');
        return;
      }

      for (const nota of pending) {
        if (await this.sendNota(nota.id)) {
          sent += 1;
        } else {
          failed += 1;
        }
      }

      this._processPendingMessage.set(
        `Processamento concluido. Enviados: ${sent}. Com falha: ${failed}.`,
      );
      this.loadPage(this._lastFilter);
    } finally {
      this._isProcessingPending.set(false);
    }
  }

  /** Envia a prefeitura uma unica nota "A processar" (acao "Enviar Nota" da lista). */
  async processOne(notaId: string): Promise<void> {
    if (this._sendingId() || this._isProcessingPending()) {
      return;
    }

    this._sendingId.set(notaId);
    this._processPendingMessage.set(null);
    try {
      const ok = await this.sendNota(notaId);
      this._processPendingMessage.set(
        ok ? 'Nota enviada a prefeitura.' : 'A prefeitura retornou erros no envio da nota (veja abaixo da linha).',
      );
      this.loadPage(this._lastFilter);
    } finally {
      this._sendingId.set(null);
    }
  }

  /** Envia o RPS enfileirado e guarda os erros da prefeitura para exibir abaixo da linha. */
  private async sendNota(notaId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.nfseApiService.processarRpsEnfileirado(notaId));
      this.setSendErrors(notaId, response.success ? [] : this.mapResponseErrors(response));
      return response.success;
    } catch (error: unknown) {
      this.setSendErrors(notaId, [
        {
          codigo: error instanceof NfseApiError && error.status ? String(error.status) : '-',
          descricao:
            error instanceof NfseApiError ? error.message : 'Falha de comunicacao no envio da nota.',
        },
      ]);
      return false;
    }
  }

  private setSendErrors(notaId: string, erros: NotaFiscalEventoItem[]): void {
    this._sendErrors.update((current) => {
      const next = { ...current };
      if (erros.length > 0) {
        next[notaId] = erros;
      } else {
        delete next[notaId];
      }
      return next;
    });
  }

  private mapResponseErrors(response: ProcessarRpsResponse): NotaFiscalEventoItem[] {
    const erros = (response.errors ?? []).map((e) => ({
      codigo: String(e.codigo),
      descricao: e.descricao ?? '',
    }));
    return erros.length > 0 ? erros : [{ codigo: '-', descricao: response.message }];
  }

  private async loadAllByStatus(status: string): Promise<NotaFiscalItemResponse[]> {
    const pageSize = 100;
    const first = await firstValueFrom(
      this.nfseApiService.searchNotasFiscais({ status, page: 1, pageSize }),
    );
    const items = [...(first.items ?? [])];
    const totalPages = first.totalPages ?? 1;
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await firstValueFrom(
        this.nfseApiService.searchNotasFiscais({ status, page, pageSize }),
      );
      items.push(...(next.items ?? []));
    }

    return items;
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar as notas fiscais neste momento.';
  }
}
