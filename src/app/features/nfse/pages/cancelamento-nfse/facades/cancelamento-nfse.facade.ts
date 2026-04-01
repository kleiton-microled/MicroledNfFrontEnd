import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  CancelarNotaFiscalRequest,
  CancelarNotaFiscalResponse,
  CertificateResponse,
  NfseApiError,
} from '../../../data-access/models/nfse-api.models';
import { NfseApiService } from '../../../data-access/services/nfse-api.service';

@Injectable()
export class CancelamentoNfseFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _result = signal<CancelarNotaFiscalResponse | null>(null);
  private readonly _currentCertificate = signal<CertificateResponse | null>(null);
  private readonly _loadingCurrentCertificate = signal(false);
  private readonly _currentCertificateMessage = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly result = this._result.asReadonly();
  readonly currentCertificate = this._currentCertificate.asReadonly();
  readonly loadingCurrentCertificate = this._loadingCurrentCertificate.asReadonly();
  readonly currentCertificateMessage = this._currentCertificateMessage.asReadonly();

  loadCurrentCertificate(): void {
    this._loadingCurrentCertificate.set(true);
    this._currentCertificateMessage.set(null);

    this.nfseApiService
      .listarCertificadosDisponiveis()
      .pipe(finalize(() => this._loadingCurrentCertificate.set(false)))
      .subscribe({
        next: (certificates) => {
          const currentCertificate =
            certificates.find((certificate) => certificate.isCurrentlySelected) ?? null;

          this._currentCertificate.set(currentCertificate);

          if (!currentCertificate) {
            this._currentCertificateMessage.set(
              'Nenhum certificado atual foi encontrado. Revise a configuracao antes de cancelar a nota.',
            );
          }
        },
        error: (error: unknown) => {
          this._currentCertificate.set(null);
          this._currentCertificateMessage.set(this.getCurrentCertificateMessage(error));
        },
      });
  }

  cancelarNotaFiscal(payload: CancelarNotaFiscalRequest): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);
    this._result.set(null);

    this.nfseApiService
      .cancelarNotaFiscal(payload)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this._result.set(response);

          if (!response.sucesso || (response.erros?.length ?? 0) > 0) {
            this._errorMessage.set(response.erros?.[0] ?? response.mensagem ?? 'Falha ao cancelar a nota.');
          }
        },
        error: (error: unknown) => {
          this._result.set(null);
          this._errorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel cancelar a nota fiscal.';
  }

  private getCurrentCertificateMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar o certificado atual.';
  }
}
