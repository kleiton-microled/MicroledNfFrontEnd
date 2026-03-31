import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';

import { NfseApiService } from '../../../data-access/services/nfse-api.service';
import { NfseApiError, NfseDetalheResponse } from '../../../data-access/models/nfse-api.models';
import {
  ConsultaNfseFiltersFormValue,
  ConsultaNfseResultadoItem,
  ConsultaNfseSearchState,
  mapDetalheToResultadoItem,
  mapResumoToResultadoItem,
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
  private readonly _detailErrorMessage = signal<string | null>(null);
  private readonly _selectedDetail = signal<NfseDetalheResponse | null>(null);
  private readonly _selectedNumber = signal<string | null>(null);

  readonly results = this._results.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
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

    if (!this.hasAtLeastOneFilter(sanitizedFilters)) {
      this._hasSearched.set(true);
      this._results.set([]);
      this._total.set(0);
      this._selectedDetail.set(null);
      this._selectedNumber.set(null);
      this._errorMessage.set('Informe ao menos um filtro para realizar a pesquisa.');
      this._detailErrorMessage.set(null);
      return;
    }

    this._isLoading.set(true);
    this._hasSearched.set(true);
    this._errorMessage.set(null);
    this._detailErrorMessage.set(null);
    this._selectedDetail.set(null);
    this._selectedNumber.set(null);

    this.buildSearchRequest(sanitizedFilters)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (state) => {
          this._results.set(state.items);
          this._total.set(state.total);

          if (state.autoSelectedDetail) {
            this._selectedDetail.set(state.autoSelectedDetail);
            this._selectedNumber.set(state.autoSelectedDetail.numeroNfse);
          }
        },
        error: (error: unknown) => {
          this._results.set([]);
          this._total.set(0);
          this._selectedDetail.set(null);
          this._selectedNumber.set(null);
          this._errorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  loadDetails(item: ConsultaNfseResultadoItem): void {
    if (!item.numeroNfse) {
      this._detailErrorMessage.set('Nao foi possivel identificar o numero da NFSe para carregar os detalhes.');
      return;
    }

    if (this._selectedNumber() === item.numeroNfse && this._selectedDetail()) {
      return;
    }

    this._isDetailLoading.set(true);
    this._detailErrorMessage.set(null);
    this._selectedNumber.set(item.numeroNfse);

    this.nfseApiService
      .consultarNfsePorNumero(item.numeroNfse)
      .pipe(finalize(() => this._isDetailLoading.set(false)))
      .subscribe({
        next: (detail) => {
          this._selectedDetail.set(detail);
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
    this._detailErrorMessage.set(null);
    this._selectedDetail.set(null);
    this._selectedNumber.set(null);
  }

  private buildSearchRequest(
    filters: ConsultaNfseFiltersFormValue,
  ): Observable<ConsultaNfseSearchState> {
    if (filters.numeroNfse) {
      return this.nfseApiService.consultarNfsePorNumero(filters.numeroNfse).pipe(
        map((detail) => ({
          items: [mapDetalheToResultadoItem(detail)],
          total: 1,
          autoSelectedDetail: detail,
        })),
      );
    }

    return this.nfseApiService
      .consultarEmitidas({
        numeroRps: filters.numeroRps || undefined,
        dataInicial: filters.dataInicial || undefined,
        dataFinal: filters.dataFinal || undefined,
        cnpjCpfTomador: filters.documentoTomador || undefined,
      })
      .pipe(
        map((response) => ({
          items: response.items.map(mapResumoToResultadoItem),
          total: response.total,
        })),
      );
  }

  private sanitizeFilters(filters: ConsultaNfseFiltersFormValue): ConsultaNfseFiltersFormValue {
    return {
      numeroNfse: filters.numeroNfse.trim(),
      numeroRps: filters.numeroRps.trim(),
      dataInicial: filters.dataInicial.trim(),
      dataFinal: filters.dataFinal.trim(),
      documentoTomador: this.normalizeDocument(filters.documentoTomador),
    };
  }

  private normalizeDocument(value: string): string {
    return value.replace(/\D/g, '');
  }

  private hasAtLeastOneFilter(filters: ConsultaNfseFiltersFormValue): boolean {
    return Boolean(
      filters.numeroNfse ||
        filters.numeroRps ||
        filters.dataInicial ||
        filters.dataFinal ||
        filters.documentoTomador,
    );
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel consultar as notas fiscais neste momento.';
  }
}
