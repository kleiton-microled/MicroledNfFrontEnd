import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  CertificateResponse,
  ConsultarStatusRpsResponse,
  GerarArquivoRpsRequest,
  GerarArquivoRpsResponse,
  NfseApiError,
  ProcessarRpsRequest,
  ProcessarRpsResponse,
} from '../../../data-access/models/nfse-api.models';
import { NfseApiService } from '../../../data-access/services/nfse-api.service';
import {
  EmissaoRpsTesteFormValue,
  mapPendingRpsResponseToEmissaoRpsTesteFormValue,
} from '../models/emissao-rps-teste.models';

@Injectable()
export class EmissaoRpsTesteFacade {
  private readonly nfseApiService = inject(NfseApiService);

  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _result = signal<GerarArquivoRpsResponse | null>(null);
  private readonly _isProcessing = signal(false);
  private readonly _processErrorMessage = signal<string | null>(null);
  private readonly _processResult = signal<ProcessarRpsResponse | null>(null);
  private readonly _isCheckingStatus = signal(false);
  private readonly _statusErrorMessage = signal<string | null>(null);
  private readonly _statusResult = signal<ConsultarStatusRpsResponse | null>(null);
  private readonly _protocol = signal<string>('');
  private readonly _currentCertificate = signal<CertificateResponse | null>(null);
  private readonly _loadingCurrentCertificate = signal(false);
  private readonly _currentCertificateMessage = signal<string | null>(null);
  private readonly _isImportingPending = signal(false);
  private readonly _importPendingErrorMessage = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly result = this._result.asReadonly();
  readonly isProcessing = this._isProcessing.asReadonly();
  readonly processErrorMessage = this._processErrorMessage.asReadonly();
  readonly processResult = this._processResult.asReadonly();
  readonly isCheckingStatus = this._isCheckingStatus.asReadonly();
  readonly statusErrorMessage = this._statusErrorMessage.asReadonly();
  readonly statusResult = this._statusResult.asReadonly();
  readonly protocol = this._protocol.asReadonly();
  readonly currentCertificate = this._currentCertificate.asReadonly();
  readonly loadingCurrentCertificate = this._loadingCurrentCertificate.asReadonly();
  readonly currentCertificateMessage = this._currentCertificateMessage.asReadonly();
  readonly isImportingPending = this._isImportingPending.asReadonly();
  readonly importPendingErrorMessage = this._importPendingErrorMessage.asReadonly();

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
              'Nenhum certificado atual foi encontrado. Revise a configuracao antes de gerar o arquivo.',
            );
          }
        },
        error: (error: unknown) => {
          this._currentCertificate.set(null);
          this._currentCertificateMessage.set(this.getCurrentCertificateMessage(error));
        },
      });
  }

  importPendingRps(
    currentForm: EmissaoRpsTesteFormValue,
    onMapped: (value: EmissaoRpsTesteFormValue) => void,
  ): void {
    this._isImportingPending.set(true);
    this._importPendingErrorMessage.set(null);

    this.nfseApiService
      .obterPendingRps()
      .pipe(finalize(() => this._isImportingPending.set(false)))
      .subscribe({
        next: (response) => {
          if (response.count === 0 || !response.request?.rpsList?.length) {
            this._importPendingErrorMessage.set('Nao ha RPS pendente para importar.');
            return;
          }

          const mapped = mapPendingRpsResponseToEmissaoRpsTesteFormValue(response, currentForm);
          onMapped(mapped);
        },
        error: (error: unknown) => {
          this._importPendingErrorMessage.set(this.getImportPendingErrorMessage(error));
        },
      });
  }

  generateFiles(payload: GerarArquivoRpsRequest): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);
    this._result.set(null);

    this.nfseApiService
      .gerarArquivosRps(payload)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this._result.set(response);

          if (!response.success) {
            this._errorMessage.set(response.errors[0] ?? response.message);
          }
        },
        error: (error: unknown) => {
          this._result.set(null);
          this._errorMessage.set(this.getFriendlyErrorMessage(error));
        },
      });
  }

  processRps(payload: ProcessarRpsRequest): void {
    this._isProcessing.set(true);
    this._processErrorMessage.set(null);
    this._processResult.set(null);

    this.nfseApiService
      .processarRps(payload)
      .pipe(finalize(() => this._isProcessing.set(false)))
      .subscribe({
        next: (response) => {
          this._processResult.set(response);
          this._protocol.set(response.protocol ?? '');

          if (!response.success) {
            this._processErrorMessage.set(response.errors[0] ?? response.message);
          }
        },
        error: (error: unknown) => {
          this._processResult.set(null);
          this._processErrorMessage.set(this.getProcessErrorMessage(error));
        },
      });
  }

  setProtocol(protocol: string): void {
    this._protocol.set(protocol);
  }

  consultarStatus(): void {
    const protocol = this._protocol().trim();
    const cnpjRemetente = this._currentCertificate()?.cnpj?.trim() ?? '';

    if (!protocol) {
      this._statusErrorMessage.set('Informe ou gere um protocolo antes de consultar o status.');
      this._statusResult.set(null);
      return;
    }

    if (!cnpjRemetente) {
      this._statusErrorMessage.set(
        'Nao foi encontrado um CNPJ no certificado atual para consultar o status do protocolo.',
      );
      this._statusResult.set(null);
      return;
    }

    this._isCheckingStatus.set(true);
    this._statusErrorMessage.set(null);
    this._statusResult.set(null);

    this.nfseApiService
      .consultarStatusRps({ numeroProtocolo: protocol, cnpjRemetente })
      .pipe(finalize(() => this._isCheckingStatus.set(false)))
      .subscribe({
        next: (response) => {
          this._statusResult.set(response);
          if (response.erros.length > 0) {
            this._statusErrorMessage.set(response.erros[0]);
          }
        },
        error: (error: unknown) => {
          this._statusResult.set(null);
          this._statusErrorMessage.set(this.getStatusErrorMessage(error));
        },
      });
  }

  openGeneratedFile(path: string | null): void {
    if (!path) {
      return;
    }

    const fileUrl = this.toFileUrl(path);
    window.open(fileUrl, '_blank', 'noopener');
  }

  private toFileUrl(path: string): string {
    const normalizedPath = path.replace(/\\/g, '/');

    if (/^[A-Za-z]:\//.test(normalizedPath)) {
      return `file:///${normalizedPath}`;
    }

    return `file://${normalizedPath}`;
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel gerar os arquivos RPS.';
  }

  private getProcessErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel enviar a nota.';
  }

  private getStatusErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel consultar o status do protocolo.';
  }

  private getCurrentCertificateMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel carregar o certificado atual.';
  }

  private getImportPendingErrorMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }

    return 'Nao foi possivel importar o RPS pendente.';
  }
}
