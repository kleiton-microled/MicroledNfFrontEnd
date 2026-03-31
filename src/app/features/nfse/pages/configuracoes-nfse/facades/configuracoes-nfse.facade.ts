import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { CertificateResponse, NfseApiError } from '../../../data-access/models/nfse-api.models';
import { NfseApiService } from '../../../data-access/services/nfse-api.service';

@Injectable()
export class ConfiguracoesNfseFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _certificates = signal<CertificateResponse[]>([]);
  private readonly _selectedCertificate = signal<CertificateResponse | null>(null);
  private readonly _loadingCertificates = signal(false);
  private readonly _certificatesErrorMessage = signal<string | null>(null);
  private readonly _isCertificateModalOpen = signal(false);

  readonly certificates = this._certificates.asReadonly();
  readonly selectedCertificate = this._selectedCertificate.asReadonly();
  readonly loadingCertificates = this._loadingCertificates.asReadonly();
  readonly certificatesErrorMessage = this._certificatesErrorMessage.asReadonly();
  readonly isCertificateModalOpen = this._isCertificateModalOpen.asReadonly();

  initialize(): void {
    this.openCertificateModal();
    this.loadCertificates();
  }

  openCertificateModal(): void {
    this._isCertificateModalOpen.set(true);
  }

  closeCertificateModal(): void {
    this._isCertificateModalOpen.set(false);
  }

  loadCertificates(): void {
    this._loadingCertificates.set(true);
    this._certificatesErrorMessage.set(null);

    this.nfseApiService
      .listarCertificadosDisponiveis()
      .pipe(finalize(() => this._loadingCertificates.set(false)))
      .subscribe({
        next: (certificates) => {
          this._certificates.set(certificates);

          const currentSelected =
            certificates.find((certificate) => certificate.isCurrentlySelected) ?? null;

          if (currentSelected) {
            this._selectedCertificate.set(currentSelected);
          }
        },
        error: (error: unknown) => {
          this._certificates.set([]);
          this._certificatesErrorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  selectCertificate(certificate: CertificateResponse): void {
    this._selectedCertificate.set(certificate);
    this.closeCertificateModal();
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar os certificados disponiveis.';
  }
}
