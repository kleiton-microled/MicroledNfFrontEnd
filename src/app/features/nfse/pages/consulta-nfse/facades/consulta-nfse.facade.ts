import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';

import { NfseApiService } from '../../../data-access/services/nfse-api.service';
import {
  NotaFiscalConsultaItemResponse,
  NfseApiError,
} from '../../../data-access/models/nfse-api.models';
import {
  ConsultaNfseFiltersFormValue,
  ConsultaNfseResultadoItem,
  ConsultaNfseSearchState,
  mapConsultaRequest,
  mapConsultaResponseToResultadoItem,
} from '../models/consulta-nfse.models';

@Injectable()
export class ConsultaNfseFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _results = signal<ConsultaNfseResultadoItem[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _isDetailLoading = signal(false);
  private readonly _hasSearched = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _warningMessages = signal<string[]>([]);
  private readonly _apiErrorMessages = signal<string[]>([]);
  private readonly _detailErrorMessage = signal<string | null>(null);
  private readonly _selectedDetail = signal<NotaFiscalConsultaItemResponse | null>(null);
  private readonly _selectedNumber = signal<string | null>(null);

  readonly results = this._results.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly warningMessages = this._warningMessages.asReadonly();
  readonly apiErrorMessages = this._apiErrorMessages.asReadonly();
  readonly detailErrorMessage = this._detailErrorMessage.asReadonly();
  readonly selectedDetail = this._selectedDetail.asReadonly();
  readonly selectedNumber = this._selectedNumber.asReadonly();

  readonly hasResults = computed(() => this._results().length > 0);
  readonly isEmpty = computed(
    () =>
      this._hasSearched() && !this._isLoading() && !this._errorMessage() && this._results().length === 0,
  );

  search(filters: ConsultaNfseFiltersFormValue): void {
    const sanitizedFilters = this.sanitizeFilters(filters);

    if (!this.hasRequiredFilters(sanitizedFilters)) {
      this._hasSearched.set(true);
      this._results.set([]);
      this._total.set(0);
      this._selectedDetail.set(null);
      this._selectedNumber.set(null);
      this._warningMessages.set([]);
      this._apiErrorMessages.set([]);
      this._errorMessage.set(
        'Informe inscricao do prestador, numero da nota e codigo de verificacao para realizar a consulta.',
      );
      this._detailErrorMessage.set(null);
      return;
    }

    this._isLoading.set(true);
    this._hasSearched.set(true);
    this._errorMessage.set(null);
    this._warningMessages.set([]);
    this._apiErrorMessages.set([]);
    this._detailErrorMessage.set(null);
    this._selectedDetail.set(null);
    this._selectedNumber.set(null);

    this.buildSearchRequest(sanitizedFilters)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (state) => {
          this._results.set(state.items);
          this._total.set(state.total);
          this._warningMessages.set(state.alertas);
          this._apiErrorMessages.set(state.erros);

          if (state.autoSelectedDetail) {
            this._selectedDetail.set(state.autoSelectedDetail);
            this._selectedNumber.set(state.items[0]?.numeroNFe ?? null);
          }
        },
        error: (error: unknown) => {
          this._results.set([]);
          this._total.set(0);
          this._selectedDetail.set(null);
          this._selectedNumber.set(null);
          this._warningMessages.set([]);
          this._apiErrorMessages.set([]);
          this._errorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  loadDetails(item: ConsultaNfseResultadoItem): void {
    if (!item.numeroNFe) {
      this._detailErrorMessage.set('Nao foi possivel identificar o numero da nota para carregar os detalhes.');
      return;
    }

    if (this._selectedNumber() === item.numeroNFe && this._selectedDetail()) {
      return;
    }

    this._isDetailLoading.set(true);
    this._detailErrorMessage.set(null);
    this._selectedNumber.set(item.numeroNFe);

    const payload = mapConsultaRequest({
      inscricaoPrestador: item.inscricaoPrestador,
      numeroNFe: item.numeroNFe,
      codigoVerificacao: item.codigoVerificacao,
      chaveNotaNacional: item.chaveNotaNacional ?? '',
    });

    this.nfseApiService
      .consultarNotaFiscal(payload)
      .pipe(finalize(() => this._isDetailLoading.set(false)))
      .subscribe({
        next: (response) => {
          this._selectedDetail.set(response.nFeList[0] ?? null);
          this._warningMessages.set(response.alertas);
          this._apiErrorMessages.set(response.erros);
        },
        error: (error: unknown) => {
          this._selectedDetail.set(null);
          this._detailErrorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  closeDetails(): void {
    this._selectedDetail.set(null);
    this._selectedNumber.set(null);
    this._detailErrorMessage.set(null);
  }

  reset(): void {
    this._results.set([]);
    this._total.set(0);
    this._hasSearched.set(false);
    this._errorMessage.set(null);
    this._warningMessages.set([]);
    this._apiErrorMessages.set([]);
    this._detailErrorMessage.set(null);
    this._selectedDetail.set(null);
    this._selectedNumber.set(null);
  }

  private buildSearchRequest(
    filters: ConsultaNfseFiltersFormValue,
  ): Observable<ConsultaNfseSearchState> {
    const payload = mapConsultaRequest(filters);

    return this.nfseApiService.consultarNotaFiscal(payload).pipe(
      map((response) => {
        const items = response.nFeList.map((item) => mapConsultaResponseToResultadoItem(item, payload));

        return {
          items,
          total: items.length,
          alertas: response.alertas,
          erros: response.erros,
          autoSelectedDetail: response.nFeList[0],
        };
      }),
    );
  }

  private sanitizeFilters(filters: ConsultaNfseFiltersFormValue): ConsultaNfseFiltersFormValue {
    return {
      inscricaoPrestador: this.normalizeNumeric(filters.inscricaoPrestador),
      numeroNFe: this.normalizeNumeric(filters.numeroNFe),
      codigoVerificacao: filters.codigoVerificacao.trim().toUpperCase(),
      chaveNotaNacional: filters.chaveNotaNacional.trim(),
    };
  }

  private normalizeNumeric(value: string): string {
    return value.replace(/\D/g, '');
  }

  private hasRequiredFilters(filters: ConsultaNfseFiltersFormValue): boolean {
    return Boolean(filters.inscricaoPrestador && filters.numeroNFe && filters.codigoVerificacao);
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel consultar as notas fiscais neste momento.';
  }
}
