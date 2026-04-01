import { CertificateResponse, GerarArquivoRpsRequest } from '../../../data-access/models/nfse-api.models';

export interface EmissaoRpsTesteFormValue {
  prestadorCpfCnpj: string;
  prestadorInscricaoMunicipal: string;
  prestadorRazaoSocial: string;
  dataInicio: string;
  dataFim: string;
  transacao: boolean;
  inscricaoPrestador: string;
  serieRps: string;
  numeroRps: string;
  tipoRps: string;
  dataEmissao: string;
  statusRps: string;
  tributacaoRps: string;
  codigoServico: string;
  discriminacao: string;
  valorServicos: string;
  valorDeducoes: string;
  aliquotaServicos: string;
  issRetido: boolean;
  tomadorCpfCnpj: string;
  tomadorRazaoSocial: string;
  tomadorEmail: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCodigoMunicipio: string;
  enderecoUf: string;
  enderecoCep: string;
}

export function getDefaultEmissaoRpsTesteFormValue(): EmissaoRpsTesteFormValue {
  return {
    prestadorCpfCnpj: '02126914000129',
    prestadorInscricaoMunicipal: '37684280',
    prestadorRazaoSocial: 'AMK TECH SISTEMAS LTDA',
    dataInicio: '2026-03-31',
    dataFim: '2026-03-31',
    transacao: true,
    inscricaoPrestador: '37684280',
    serieRps: 'A',
    numeroRps: '1001',
    tipoRps: 'RPS',
    dataEmissao: '2026-03-31',
    statusRps: 'N',
    tributacaoRps: 'T',
    codigoServico: '1234',
    discriminacao: 'SERVICOS DE DESENVOLVIMENTO DE SOFTWARE',
    valorServicos: '1000.00',
    valorDeducoes: '0.00',
    aliquotaServicos: '2.90',
    issRetido: false,
    tomadorCpfCnpj: '12345678000190',
    tomadorRazaoSocial: 'CLIENTE EXEMPLO LTDA',
    tomadorEmail: 'financeiro@cliente.com',
    enderecoLogradouro: 'RUA EXEMPLO',
    enderecoNumero: '100',
    enderecoBairro: 'CENTRO',
    enderecoCodigoMunicipio: '3550308',
    enderecoUf: 'SP',
    enderecoCep: '1001000',
  };
}

export function applyCertificateToEmissaoRpsTesteFormValue(
  currentValue: EmissaoRpsTesteFormValue,
  certificate: CertificateResponse,
): EmissaoRpsTesteFormValue {
  const cpfCnpj = certificate.cnpj ?? certificate.cpf ?? currentValue.prestadorCpfCnpj;
  const inscricaoMunicipal =
    certificate.inscricaoMunicipal !== null && certificate.inscricaoMunicipal !== undefined
      ? String(certificate.inscricaoMunicipal)
      : currentValue.prestadorInscricaoMunicipal;
  const razaoSocial =
    certificate.razaoSocial?.trim() || certificate.simpleName?.trim() || currentValue.prestadorRazaoSocial;

  return {
    ...currentValue,
    prestadorCpfCnpj: cpfCnpj,
    prestadorInscricaoMunicipal: inscricaoMunicipal,
    prestadorRazaoSocial: razaoSocial,
    inscricaoPrestador: inscricaoMunicipal || currentValue.inscricaoPrestador,
  };
}

export function mapFormToGerarArquivoRpsRequest(
  value: EmissaoRpsTesteFormValue,
): GerarArquivoRpsRequest {
  return {
    prestador: {
      cpfCnpj: normalizeNumeric(value.prestadorCpfCnpj),
      inscricaoMunicipal: Number(normalizeNumeric(value.prestadorInscricaoMunicipal)),
      razaoSocial: value.prestadorRazaoSocial.trim(),
    },
    rpsList: [
      {
        inscricaoPrestador: Number(normalizeNumeric(value.inscricaoPrestador)),
        serieRps: value.serieRps.trim(),
        numeroRps: Number(normalizeNumeric(value.numeroRps)),
        tipoRPS: value.tipoRps.trim(),
        dataEmissao: value.dataEmissao,
        statusRPS: value.statusRps.trim(),
        tributacaoRPS: value.tributacaoRps.trim(),
        item: {
          codigoServico: Number(normalizeNumeric(value.codigoServico)),
          discriminacao: value.discriminacao.trim(),
          valorServicos: Number(value.valorServicos),
          valorDeducoes: Number(value.valorDeducoes),
          aliquotaServicos: Number(value.aliquotaServicos),
          issRetido: value.issRetido,
        },
        tomador: {
          cpfCnpj: normalizeNumeric(value.tomadorCpfCnpj),
          razaoSocial: value.tomadorRazaoSocial.trim(),
          email: value.tomadorEmail.trim(),
          endereco: {
            logradouro: value.enderecoLogradouro.trim(),
            numero: value.enderecoNumero.trim(),
            bairro: value.enderecoBairro.trim(),
            codigoMunicipio: Number(normalizeNumeric(value.enderecoCodigoMunicipio)),
            uf: value.enderecoUf.trim().toUpperCase(),
            cep: Number(normalizeNumeric(value.enderecoCep)),
          },
        },
      },
    ],
    dataInicio: value.dataInicio,
    dataFim: value.dataFim,
    transacao: value.transacao,
  };
}

function normalizeNumeric(value: string): string {
  return value.replace(/\D/g, '');
}
