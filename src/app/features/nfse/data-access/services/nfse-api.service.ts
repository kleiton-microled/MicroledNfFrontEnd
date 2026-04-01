import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  ApiListResponse,
  CancelarNfsePayload,
  CertificateResponse,
  ConsultarNotaFiscalRequest,
  ConsultarNotaFiscalResponse,
  CnpjConsultaResponse,
  ConsultaNfsePorRpsRequest,
  EmitirLotePayload,
  EmitirRpsPayload,
  GerarArquivoRpsRequest,
  GerarArquivoRpsResponse,
  LoteInformacoesResponse,
  LoteResumoResponse,
  NfseApiError,
  NfseApiErrorDetails,
  NfseDetalheResponse,
  NfseQueryFilters,
  NfseResumoResponse,
  OperacaoNfseResponse,
  ProcessarRpsResponse,
  QueryParamValue,
  SelectCertificatePayload,
} from '../models/nfse-api.models';
import {
  CERTIFICATES_API_URL,
  CERTIFICATES_SELECT_API_URL,
  LOCAL_NFE_CONSULT_API_URL,
  LOCAL_RPS_PROCESS_API_URL,
  LOCAL_RPS_GENERATE_FILES_API_URL,
  NFSE_API_BASE_URL,
} from '../tokens/nfse-api-base-url.token';

@Injectable({
  providedIn: 'root',
})
export class NfseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(NFSE_API_BASE_URL);
  private readonly certificatesApiUrl = inject(CERTIFICATES_API_URL);
  private readonly certificatesSelectApiUrl = inject(CERTIFICATES_SELECT_API_URL);
  private readonly localNfeConsultApiUrl = inject(LOCAL_NFE_CONSULT_API_URL);
  private readonly localRpsGenerateFilesApiUrl = inject(LOCAL_RPS_GENERATE_FILES_API_URL);
  private readonly localRpsProcessApiUrl = inject(LOCAL_RPS_PROCESS_API_URL);

  consultarNfsePorNumero(numero: string): Observable<NfseDetalheResponse> {
    return this.http
      .get<NfseDetalheResponse>(this.buildUrl(`notas/${encodeURIComponent(numero)}`))
      .pipe(catchError((error) => this.handleError('consulta da NFSe por numero', error)));
  }

  consultarNfsePorRps(
    inscricaoPrestador: string,
    serieRps: string,
    numeroRps: string,
  ): Observable<NfseDetalheResponse> {
    const request: ConsultaNfsePorRpsRequest = {
      inscricaoPrestador,
      serieRps,
      numeroRps,
    };

    return this.http
      .get<NfseDetalheResponse>(this.buildUrl('notas/por-rps'), {
        params: this.buildParams(request),
      })
      .pipe(catchError((error) => this.handleError('consulta da NFSe por RPS', error)));
  }

  consultarEmitidas(filtros: NfseQueryFilters): Observable<ApiListResponse<NfseResumoResponse>> {
    return this.http
      .get<ApiListResponse<NfseResumoResponse>>(this.buildUrl('notas/emitidas'), {
        params: this.buildParams(filtros),
      })
      .pipe(catchError((error) => this.handleError('consulta de NFSe emitidas', error)));
  }

  consultarRecebidas(filtros: NfseQueryFilters): Observable<ApiListResponse<NfseResumoResponse>> {
    return this.http
      .get<ApiListResponse<NfseResumoResponse>>(this.buildUrl('notas/recebidas'), {
        params: this.buildParams(filtros),
      })
      .pipe(catchError((error) => this.handleError('consulta de NFSe recebidas', error)));
  }

  consultarLote(numeroLote: string): Observable<LoteResumoResponse> {
    return this.http
      .get<LoteResumoResponse>(this.buildUrl(`lotes/${encodeURIComponent(numeroLote)}`))
      .pipe(catchError((error) => this.handleError('consulta de lote', error)));
  }

  consultarInformacoesLote(
    numeroLote: string,
    inscricaoPrestador: string,
  ): Observable<LoteInformacoesResponse> {
    return this.http
      .get<LoteInformacoesResponse>(
        this.buildUrl(`lotes/${encodeURIComponent(numeroLote)}/informacoes`),
        {
          params: this.buildParams({ inscricaoPrestador }),
        },
      )
      .pipe(catchError((error) => this.handleError('consulta de informacoes do lote', error)));
  }

  consultarCnpj(cnpj: string): Observable<CnpjConsultaResponse> {
    return this.http
      .get<CnpjConsultaResponse>(this.buildUrl(`cnpj/${encodeURIComponent(cnpj)}`))
      .pipe(catchError((error) => this.handleError('consulta de CNPJ', error)));
  }

  listarCertificadosDisponiveis(): Observable<CertificateResponse[]> {
    return this.http
      .get<CertificateResponse[]>(this.certificatesApiUrl)
      .pipe(catchError((error) => this.handleError('consulta de certificados disponiveis', error)));
  }

  selecionarCertificado(payload: SelectCertificatePayload): Observable<void> {
    return this.http
      .post<void>(this.certificatesSelectApiUrl, payload)
      .pipe(catchError((error) => this.handleError('selecao do certificado', error)));
  }

  consultarNotaFiscal(payload: ConsultarNotaFiscalRequest): Observable<ConsultarNotaFiscalResponse> {
    return this.http
      .post<ConsultarNotaFiscalResponse>(this.localNfeConsultApiUrl, payload)
      .pipe(catchError((error) => this.handleError('consulta da nota fiscal', error)));
  }

  gerarArquivosRps(payload: GerarArquivoRpsRequest): Observable<GerarArquivoRpsResponse> {
    return this.http
      .post<GerarArquivoRpsResponse>(this.localRpsGenerateFilesApiUrl, payload)
      .pipe(catchError((error) => this.handleError('geracao de arquivos RPS', error)));
  }

  processarRps(payload: GerarArquivoRpsRequest): Observable<ProcessarRpsResponse> {
    return this.http
      .post<ProcessarRpsResponse>(this.localRpsProcessApiUrl, payload)
      .pipe(catchError((error) => this.handleError('envio da nota', error)));
  }

  emitirRps(payload: EmitirRpsPayload): Observable<OperacaoNfseResponse> {
    return this.http
      .post<OperacaoNfseResponse>(this.buildUrl('rps'), payload)
      .pipe(catchError((error) => this.handleError('emissao de RPS', error)));
  }

  emitirLote(payload: EmitirLotePayload): Observable<OperacaoNfseResponse> {
    return this.http
      .post<OperacaoNfseResponse>(this.buildUrl('lotes'), payload)
      .pipe(catchError((error) => this.handleError('emissao de lote', error)));
  }

  cancelarNfse(payload: CancelarNfsePayload): Observable<OperacaoNfseResponse> {
    return this.http
      .post<OperacaoNfseResponse>(this.buildUrl('notas/cancelamentos'), payload)
      .pipe(catchError((error) => this.handleError('cancelamento de NFSe', error)));
  }

  private buildUrl(path: string): string {
    const normalizedBaseUrl = this.baseUrl.replace(/\/$/, '');
    return `${normalizedBaseUrl}/${path}`;
  }

  private buildParams<T extends object>(values: T): HttpParams {
    let params = new HttpParams();

    Object.entries(values as Record<string, QueryParamValue>).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      params = params.set(key, value instanceof Date ? value.toISOString() : String(value));
    });

    return params;
  }

  private handleError(context: string, error: HttpErrorResponse): Observable<never> {
    const apiError = new NfseApiError(
      this.resolveErrorMessage(context, error),
      error.status,
      this.extractErrorDetails(error),
    );

    return throwError(() => apiError);
  }

  private resolveErrorMessage(context: string, error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (this.hasMessage(error.error)) {
      return error.error.message;
    }

    if (error.status === 0) {
      return `Falha de comunicacao durante ${context}.`;
    }

    return `Nao foi possivel concluir a ${context}.`;
  }

  private extractErrorDetails(error: HttpErrorResponse): NfseApiErrorDetails | undefined {
    if (!error.error) {
      return undefined;
    }

    if (this.hasErrorDetails(error.error)) {
      return {
        code: error.error.code,
        fields: error.error.fields,
        raw: error.error,
      };
    }

    return {
      raw: error.error,
    };
  }

  private hasMessage(value: unknown): value is { message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      typeof value.message === 'string'
    );
  }

  private hasErrorDetails(
    value: unknown,
  ): value is { code?: string; fields?: Record<string, string[]>; message?: string } {
    return typeof value === 'object' && value !== null;
  }
}
