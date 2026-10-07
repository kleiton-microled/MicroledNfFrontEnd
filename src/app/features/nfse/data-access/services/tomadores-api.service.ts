import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  ApiEnvelopeResponse,
  NfseApiError,
  PagedTomadorResponse,
  TomadorRequest,
  TomadorResponse,
} from '../models/nfse-api.models';
import { TOMADORES_API_URL } from '../tokens/nfse-api-base-url.token';

@Injectable({
  providedIn: 'root',
})
export class TomadoresApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(TOMADORES_API_URL);

  search(query: string, page = 1, pageSize = 50): Observable<PagedTomadorResponse> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (query.trim()) {
      params = params.set('q', query.trim());
    }

    return this.http
      .get<ApiEnvelopeResponse<PagedTomadorResponse>>(this.apiUrl, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope, 'Nao foi possivel carregar os tomadores.')),
        catchError((error) => this.handleError('consulta de tomadores', error)),
      );
  }

  /** Retorna null quando o CPF/CNPJ nao esta cadastrado. */
  getByCpfCnpj(cpfCnpj: string): Observable<TomadorResponse | null> {
    return this.http
      .get<ApiEnvelopeResponse<TomadorResponse>>(
        `${this.apiUrl}/cpf-cnpj/${encodeURIComponent(cpfCnpj)}`,
      )
      .pipe(
        map((envelope) => (envelope.success ? envelope.data : null)),
        catchError((error: HttpErrorResponse) =>
          error.status === 404 ? of(null) : this.handleError('consulta do tomador', error),
        ),
      );
  }

  create(request: TomadorRequest): Observable<TomadorResponse> {
    return this.http
      .post<ApiEnvelopeResponse<TomadorResponse>>(this.apiUrl, request)
      .pipe(
        map((envelope) => this.unwrap(envelope, 'Nao foi possivel cadastrar o tomador.')),
        catchError((error) => this.handleError('cadastro do tomador', error)),
      );
  }

  update(id: string, request: TomadorRequest): Observable<TomadorResponse> {
    return this.http
      .put<ApiEnvelopeResponse<TomadorResponse>>(`${this.apiUrl}/${encodeURIComponent(id)}`, request)
      .pipe(
        map((envelope) => this.unwrap(envelope, 'Nao foi possivel atualizar o tomador.')),
        catchError((error) => this.handleError('atualizacao do tomador', error)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiEnvelopeResponse<boolean>>(`${this.apiUrl}/${encodeURIComponent(id)}`)
      .pipe(
        map(() => undefined),
        catchError((error) => this.handleError('exclusao do tomador', error)),
      );
  }

  private unwrap<T>(envelope: ApiEnvelopeResponse<T>, fallbackMessage: string): T {
    if (!envelope.success || !envelope.data) {
      throw new NfseApiError(envelope.message?.trim() || fallbackMessage, 200);
    }

    return envelope.data;
  }

  private handleError(context: string, error: unknown): Observable<never> {
    if (error instanceof NfseApiError) {
      return throwError(() => error);
    }

    const httpError = error as HttpErrorResponse;
    const body = httpError.error as { message?: string } | string | null;
    let message: string;
    if (typeof body === 'string' && body.trim()) {
      message = body;
    } else if (body && typeof body === 'object' && body.message) {
      message = body.message;
    } else if (httpError.status === 0) {
      message = `Falha de comunicacao durante ${context}.`;
    } else {
      message = `Nao foi possivel concluir a ${context}.`;
    }

    return throwError(() => new NfseApiError(message, httpError.status, { raw: httpError.error }));
  }
}
