import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ConsultarNotaFiscalResponse } from '../../../../data-access/models/nfse-api.models';

@Component({
  selector: 'app-consulta-nfse-detail-panel',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, KeyValuePipe],
  templateUrl: './consulta-nfse-detail-panel.html',
  styleUrl: './consulta-nfse-detail-panel.scss',
})
export class ConsultaNfseDetailPanelComponent {
  readonly detail = input<ConsultarNotaFiscalResponse | null>(null);
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly closePanel = output<void>();

  protected readonly summaryKeys = [
    'numeroNFe',
    'numeroNfse',
    'inscricaoPrestador',
    'codigoVerificacao',
    'chaveNotaNacional',
    'status',
    'dataEmissao',
    'valorTotal',
    'valorServicos',
    'valorLiquido',
  ];

  protected getSummaryEntries(detail: ConsultarNotaFiscalResponse): Array<{ key: string; value: unknown }> {
    return this.summaryKeys
      .map((key) => ({ key, value: detail[key] }))
      .filter((entry) => entry.value !== null && entry.value !== undefined && entry.value !== '');
  }

  protected getObjectSections(
    detail: ConsultarNotaFiscalResponse,
  ): Array<{ key: string; value: Record<string, unknown> }> {
    return Object.entries(detail)
      .filter(
        ([key, value]) =>
          !this.summaryKeys.includes(key) &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value),
      )
      .map(([key, value]) => ({ key, value: value as Record<string, unknown> }));
  }

  protected formatRecordValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  }

  protected formatSectionTitle(value: string): string {
    return value
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (character) => character.toUpperCase())
      .trim();
  }

  protected isCurrencyField(key: string): boolean {
    return key === 'valorTotal' || key === 'valorServicos' || key === 'valorLiquido';
  }

  protected isDateField(key: string): boolean {
    return key === 'dataEmissao';
  }

  protected getNumericValue(value: unknown): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? null : parsedValue;
    }

    return null;
  }

  protected getDateValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}
