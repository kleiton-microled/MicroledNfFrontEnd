import {
  ConsultarNotaFiscalRequest,
  ConsultarNotaFiscalResponse,
  NotaFiscalConsultaItemResponse,
} from '../../../data-access/models/nfse-api.models';

export interface ConsultaNfseFiltersFormValue {
  inscricaoPrestador: string;
  numeroNFe: string;
  codigoVerificacao: string;
  chaveNotaNacional: string;
}

export interface ConsultaNfseResultadoItem {
  numeroNFe: string;
  inscricaoPrestador: string;
  codigoVerificacao: string;
  chaveNotaNacional?: string;
  dataEmissao?: string;
  dataFatoGerador?: string;
  status?: string;
  valorTotal?: number;
  valorServicos?: number;
  valorDeducoes?: number;
  valorISS?: number;
  valorLiquido?: number;
}

export interface ConsultaNfseSearchState {
  items: ConsultaNfseResultadoItem[];
  total: number;
  alertas: string[];
  erros: string[];
  autoSelectedDetail?: NotaFiscalConsultaItemResponse;
}

export function mapConsultaRequest(filters: ConsultaNfseFiltersFormValue): ConsultarNotaFiscalRequest {
  return {
    chaveNFe: {
      inscricaoPrestador: Number(filters.inscricaoPrestador),
      numeroNFe: Number(filters.numeroNFe),
      codigoVerificacao: filters.codigoVerificacao,
      chaveNotaNacional: filters.chaveNotaNacional || null,
    },
  };
}

export function mapConsultaResponseToResultadoItem(
  response: NotaFiscalConsultaItemResponse,
  request: ConsultarNotaFiscalRequest,
): ConsultaNfseResultadoItem {
  return {
    numeroNFe:
      resolveStringValue(response.chaveNFe, ['numeroNFe']) ??
      resolveStringValue(response, ['numeroNfse']) ??
      String(request.chaveNFe.numeroNFe),
    inscricaoPrestador:
      resolveStringValue(response.chaveNFe, ['inscricaoPrestador']) ??
      String(request.chaveNFe.inscricaoPrestador),
    codigoVerificacao:
      resolveStringValue(response, ['codigoVerificacao']) ??
      resolveStringValue(response.chaveNFe, ['codigoVerificacao']) ??
      request.chaveNFe.codigoVerificacao,
    chaveNotaNacional:
      resolveStringValue(response.chaveNFe, ['chaveNotaNacional']) ??
      request.chaveNFe.chaveNotaNacional ??
      undefined,
    dataEmissao: resolveStringValue(response, ['dataEmissao']),
    dataFatoGerador: resolveStringValue(response, ['dataFatoGerador']),
    status: resolveStringValue(response, ['status']),
    valorTotal: resolveNumberValue(response, ['valorTotal']),
    valorServicos: resolveNumberValue(response, ['valorServicos']),
    valorDeducoes: resolveNumberValue(response, ['valorDeducoes']),
    valorISS: resolveNumberValue(response, ['valorISS']),
    valorLiquido: resolveNumberValue(response, ['valorLiquido']),
  };
}

function resolveStringValue(
  source: object | undefined,
  keys: string[],
): string | undefined {
  if (!source) {
    return undefined;
  }

  const sourceRecord = source as Record<string, unknown>;

  for (const key of keys) {
    const value = sourceRecord[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}

function resolveNumberValue(
  source: object | undefined,
  keys: string[],
): number | undefined {
  if (!source) {
    return undefined;
  }

  const sourceRecord = source as Record<string, unknown>;

  for (const key of keys) {
    const value = sourceRecord[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsedValue = Number(value);

      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}
