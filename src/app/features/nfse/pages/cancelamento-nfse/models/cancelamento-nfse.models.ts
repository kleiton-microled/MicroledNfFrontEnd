import {
  CancelarNotaFiscalRequest,
  CertificateResponse,
} from '../../../data-access/models/nfse-api.models';

export interface CancelamentoNfseFormValue {
  inscricaoPrestador: string;
  numeroNFe: string;
  codigoVerificacao: string;
  chaveNotaNacional: string;
  transacao: boolean;
}

export function getDefaultCancelamentoNfseFormValue(): CancelamentoNfseFormValue {
  return {
    inscricaoPrestador: '37684280',
    numeroNFe: '2466',
    codigoVerificacao: 'Z7LPSYCU',
    chaveNotaNacional: '35503081202126914000129000000000246626033131292770',
    transacao: true,
  };
}

export function applyCertificateToCancelamentoNfseFormValue(
  currentValue: CancelamentoNfseFormValue,
  certificate: CertificateResponse,
): CancelamentoNfseFormValue {
  const inscricaoPrestador =
    certificate.inscricaoMunicipal !== null && certificate.inscricaoMunicipal !== undefined
      ? String(certificate.inscricaoMunicipal)
      : currentValue.inscricaoPrestador;

  return {
    ...currentValue,
    inscricaoPrestador,
  };
}

export function mapFormToCancelarNotaFiscalRequest(
  value: CancelamentoNfseFormValue,
): CancelarNotaFiscalRequest {
  return {
    chaveNFe: {
      inscricaoPrestador: Number(normalizeNumeric(value.inscricaoPrestador)),
      numeroNFe: Number(normalizeNumeric(value.numeroNFe)),
      codigoVerificacao: value.codigoVerificacao.trim(),
      chaveNotaNacional: value.chaveNotaNacional.trim() || null,
    },
    transacao: value.transacao,
  };
}

function normalizeNumeric(value: string): string {
  return value.replace(/\D/g, '');
}
