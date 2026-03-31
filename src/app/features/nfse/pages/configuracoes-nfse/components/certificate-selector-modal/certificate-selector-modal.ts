import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CertificateResponse } from '../../../../data-access/models/nfse-api.models';

@Component({
  selector: 'app-certificate-selector-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './certificate-selector-modal.html',
  styleUrl: './certificate-selector-modal.scss',
})
export class CertificateSelectorModalComponent {
  readonly certificates = input<CertificateResponse[]>([]);
  readonly loading = input(false);
  readonly selecting = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly selectedThumbprint = input<string | null>(null);
  readonly selectingThumbprint = input<string | null>(null);

  readonly close = output<void>();
  readonly refresh = output<void>();
  readonly choose = output<CertificateResponse>();
}
