import {
  ConsultarNotaFiscalRequest,
  ConsultarNotaFiscalResponse,
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
  status?: string;
  valorTotal?: number;
  valorServicos?: number;
  valorLiquido?: number;
}

export interface ConsultaNfseSearchState {
  items: ConsultaNfseResultadoItem[];
  total: number;
  autoSelectedDetail?: ConsultarNotaFiscalResponse;
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
  response: ConsultarNotaFiscalResponse,
  request: ConsultarNotaFiscalRequest,
): ConsultaNfseResultadoItem {
  return {
    numeroNFe: resolveStringValue(response, ['numeroNFe', 'numeroNfse']) ?? String(request.chaveNFe.numeroNFe),
    inscricaoPrestador:
      resolveStringValue(response, ['inscricaoPrestador']) ?? String(request.chaveNFe.inscricaoPrestador),
    codigoVerificacao:
      resolveStringValue(response, ['codigoVerificacao']) ?? request.chaveNFe.codigoVerificacao,
    chaveNotaNacional:
      resolveStringValue(response, ['chaveNotaNacional']) ?? request.chaveNFe.chaveNotaNacional ?? undefined,
    dataEmissao: resolveStringValue(response, ['dataEmissao']),
    status: resolveStringValue(response, ['status']),
    valorTotal: resolveNumberValue(response, ['valorTotal']),
    valorServicos: resolveNumberValue(response, ['valorServicos']),
    valorLiquido: resolveNumberValue(response, ['valorLiquido']),
  };
}

function resolveStringValue(
  source: ConsultarNotaFiscalResponse,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];

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
  source: ConsultarNotaFiscalResponse,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = source[key];

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
