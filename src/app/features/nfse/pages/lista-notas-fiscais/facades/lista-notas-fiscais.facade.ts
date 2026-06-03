import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { NfseApiService } from '../../../data-access/services/nfse-api.service';
import {
  NfseApiError,
  NotaFiscalFilter,
  NotaFiscalItemResponse,
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
  private _lastFilter: NotaFiscalFilter = {};

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

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

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar as notas fiscais neste momento.';
  }
}
