import { NfseDetalheResponse, NfseResumoResponse } from '../../../data-access/models/nfse-api.models';

export interface ConsultaNfseFiltersFormValue {
  numeroNfse: string;
  numeroRps: string;
  dataInicial: string;
  dataFinal: string;
  documentoTomador: string;
}

export interface ConsultaNfseResultadoItem {
  numeroNfse: string;
  numeroRps?: string;
  serieRps?: string;
  dataEmissao?: string;
  documentoTomador?: string;
  codigoVerificacao?: string;
  status?: string;
  valorServicos?: number;
  valorLiquido?: number;
}

export interface ConsultaNfseSearchState {
  items: ConsultaNfseResultadoItem[];
  total: number;
  autoSelectedDetail?: NfseDetalheResponse;
}

export function mapResumoToResultadoItem(
  response: NfseResumoResponse,
): ConsultaNfseResultadoItem {
  return {
    numeroNfse: response.numeroNfse,
    numeroRps: response.numeroRps,
    serieRps: response.serieRps,
    dataEmissao: response.dataEmissao,
    documentoTomador: response.cnpjCpfTomador,
    codigoVerificacao: response.codigoVerificacao,
    status: response.status,
    valorServicos: response.valorServicos,
    valorLiquido: response.valorLiquido,
  };
}

export function mapDetalheToResultadoItem(
  response: NfseDetalheResponse,
): ConsultaNfseResultadoItem {
  return mapResumoToResultadoItem(response);
}
