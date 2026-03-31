import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { NfseDetalheResponse } from '../../../../data-access/models/nfse-api.models';

@Component({
  selector: 'app-consulta-nfse-detail-panel',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, KeyValuePipe],
  templateUrl: './consulta-nfse-detail-panel.html',
  styleUrl: './consulta-nfse-detail-panel.scss',
})
export class ConsultaNfseDetailPanelComponent {
  readonly detail = input<NfseDetalheResponse | null>(null);
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly closePanel = output<void>();

  protected formatRecordValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  }
}
