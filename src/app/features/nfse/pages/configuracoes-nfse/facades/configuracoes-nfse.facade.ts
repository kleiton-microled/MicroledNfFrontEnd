import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  CertificateResponse,
  NfseApiError,
  SelectCertificatePayload,
} from '../../../data-access/models/nfse-api.models';
import { NfseApiService } from '../../../data-access/services/nfse-api.service';

@Injectable()
export class ConfiguracoesNfseFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _certificates = signal<CertificateResponse[]>([]);
  private readonly _selectedCertificate = signal<CertificateResponse | null>(null);
  private readonly _loadingCertificates = signal(false);
  private readonly _selectingCertificate = signal(false);
  private readonly _selectingThumbprint = signal<string | null>(null);
  private readonly _certificatesErrorMessage = signal<string | null>(null);
  private readonly _isCertificateModalOpen = signal(false);

  readonly certificates = this._certificates.asReadonly();
  readonly selectedCertificate = this._selectedCertificate.asReadonly();
  readonly loadingCertificates = this._loadingCertificates.asReadonly();
  readonly selectingCertificate = this._selectingCertificate.asReadonly();
  readonly selectingThumbprint = this._selectingThumbprint.asReadonly();
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
    const payload: SelectCertificatePayload = {
      thumbprint: certificate.thumbprint,
      storeLocation: certificate.storeLocation,
      storeName: certificate.storeName,
    };

    this._selectingCertificate.set(true);
    this._selectingThumbprint.set(certificate.thumbprint);
    this._certificatesErrorMessage.set(null);

    this.nfseApiService
      .selecionarCertificado(payload)
      .pipe(
        finalize(() => {
          this._selectingCertificate.set(false);
          this._selectingThumbprint.set(null);
        }),
      )
      .subscribe({
        next: () => {
          this._selectedCertificate.set(certificate);
          this._certificates.update((certificates) =>
            certificates.map((currentCertificate) => ({
              ...currentCertificate,
              isCurrentlySelected: currentCertificate.thumbprint === certificate.thumbprint,
            })),
          );
          this.closeCertificateModal();
        },
        error: (error: unknown) => {
          this._certificatesErrorMessage.set(this.getSelectionErrorMessage(error));
        },
      });
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar os certificados disponiveis.';
  }

  private getSelectionErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel selecionar o certificado informado.';
  }
}
