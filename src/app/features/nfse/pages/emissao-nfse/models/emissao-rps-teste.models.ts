import {
  CertificateResponse,
  GerarArquivoRpsRequest,
  PendingRpsResponse,
  ProcessarRpsRequest,
  RpsArquivoEnderecoPayload,
} from '../../../data-access/models/nfse-api.models';

export interface EmissaoRpsTesteFormValue {
  prestadorCpfCnpj: string;
  prestadorInscricaoMunicipal: string;
  prestadorRazaoSocial: string;
  prestadorEmail: string;
  prestadorTipoLogradouro: string;
  prestadorLogradouro: string;
  prestadorNumero: string;
  prestadorComplemento: string;
  prestadorBairro: string;
  prestadorCodigoMunicipio: string;
  prestadorUf: string;
  prestadorCep: string;
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
  tomadorInscricaoMunicipal: string;
  tomadorInscricaoEstadual: string;
  tomadorRazaoSocial: string;
  tomadorEmail: string;
  enderecoTipoLogradouro: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoComplemento: string;
  enderecoBairro: string;
  enderecoCodigoMunicipio: string;
  enderecoUf: string;
  enderecoCep: string;
  tributosValorPIS: string;
  tributosValorCOFINS: string;
  tributosValorINSS: string;
  tributosValorIR: string;
  tributosValorCSLL: string;
  tributosValorIPI: string;
  tributosValorCargaTributaria: string;
  tributosPercentualCargaTributaria: string;
  tributosFonteCargaTributaria: string;
  tributosValorTotalRecebido: string;
  tributosValorFinalCobrado: string;
  tributosValorMulta: string;
  tributosValorJuros: string;
  tributosNcm: string;
  ibsFinNFSe: string;
  ibsIndFinal: string;
  ibsCIndOp: string;
  ibsTpOper: string;
  ibsRefNfSe: string;
  ibsTpEnteGov: string;
  ibsIndDest: string;
  ibsDestNif: string;
  ibsDestNaoNif: string;
  ibsCClassTrib: string;
  ibsCClassTribReg: string;
  ibsNbs: string;
  ibsCLocPrestacao: string;
  ibsImovelInscricaoImobiliariaFiscal: string;
  ibsImovelCCib: string;
  ibsImovelCObra: string;
}

export function getDefaultEmissaoRpsTesteFormValue(): EmissaoRpsTesteFormValue {
  return {
    prestadorCpfCnpj: '02126914000129',
    prestadorInscricaoMunicipal: '37684280',
    prestadorRazaoSocial: 'MICROLED INFORMATICA E SERVICOS LTDA',
    prestadorEmail: 'ipsilva@microled.com.br',
    prestadorTipoLogradouro: 'AV',
    prestadorLogradouro: 'IRAI',
    prestadorNumero: '00075',
    prestadorComplemento: 'CJ 21 TORRE A',
    prestadorBairro: 'BROOKLIN',
    prestadorCodigoMunicipio: '3550308',
    prestadorUf: 'SP',
    prestadorCep: '4082000',
    dataInicio: '2026-04-01',
    dataFim: '2026-04-01',
    transacao: true,
    inscricaoPrestador: '37684280',
    serieRps: 'A',
    numeroRps: '1005',
    tipoRps: 'RPS',
    dataEmissao: '2026-04-01',
    statusRps: 'N',
    tributacaoRps: 'T',
    codigoServico: '2919',
    discriminacao: 'SERVICOS DE DESENVOLVIMENTO DE SOFTWARE TESTE',
    valorServicos: '1000.00',
    valorDeducoes: '0.00',
    aliquotaServicos: '2.9',
    issRetido: false,
    tomadorCpfCnpj: '02390435000115',
    tomadorInscricaoMunicipal: '',
    tomadorInscricaoEstadual: '633388271114',
    tomadorRazaoSocial: 'ECOPORTO SANTOS S/A',
    tomadorEmail: 'administrativoti.op@ecoportosantos.com.br',
    enderecoTipoLogradouro: 'Av.',
    enderecoLogradouro: 'ENGENHEIRO ALVES FREIRE',
    enderecoNumero: 'SN',
    enderecoComplemento: '',
    enderecoBairro: 'CAIS SABOO',
    enderecoCodigoMunicipio: '3548500',
    enderecoUf: 'SP',
    enderecoCep: '11010230',
    tributosValorPIS: '6.50',
    tributosValorCOFINS: '30.00',
    tributosValorINSS: '0.00',
    tributosValorIR: '15.00',
    tributosValorCSLL: '10.00',
    tributosValorIPI: '0.00',
    tributosValorCargaTributaria: '164.50',
    tributosPercentualCargaTributaria: '0.1645',
    tributosFonteCargaTributaria: 'IBPT',
    tributosValorTotalRecebido: '1000.00',
    tributosValorFinalCobrado: '1000.00',
    tributosValorMulta: '0.00',
    tributosValorJuros: '0.00',
    tributosNcm: '00000000',
    ibsFinNFSe: '0',
    ibsIndFinal: '1',
    ibsCIndOp: '100301',
    ibsTpOper: '',
    ibsRefNfSe: '35503081202126914000129000000000246626033131292770',
    ibsTpEnteGov: '',
    ibsIndDest: '1',
    ibsDestNif: '',
    ibsDestNaoNif: '',
    ibsCClassTrib: '000001',
    ibsCClassTribReg: '000001',
    ibsNbs: '123456789',
    ibsCLocPrestacao: '3550308',
    ibsImovelInscricaoImobiliariaFiscal: '',
    ibsImovelCCib: '',
    ibsImovelCObra: '',
  };
}

export function mapPendingRpsResponseToEmissaoRpsTesteFormValue(
  response: PendingRpsResponse,
  base: EmissaoRpsTesteFormValue,
): EmissaoRpsTesteFormValue {
  const req = response.request;
  if (!req?.rpsList?.length) {
    return base;
  }

  const rps = req.rpsList[0];
  const prest = req.prestador;
  const tom = rps.tomador;
  const item = rps.item;
  const trib = rps.tributos;
  const ibs = rps.ibsCbs;
  const dest = ibs?.dest;
  const imovel = ibs?.imovelObra;

  const pe = prest?.endereco ?? null;
  const te = tom?.endereco ?? dest?.endereco ?? imovel?.endereco ?? null;

  return {
    ...base,
    ...mapApiEnderecoToPrestadorForm(pe),
    prestadorCpfCnpj: formatDigits(prest?.cpfCnpj) || base.prestadorCpfCnpj,
    prestadorInscricaoMunicipal: numToStr(prest?.inscricaoMunicipal) || base.prestadorInscricaoMunicipal,
    prestadorRazaoSocial: prest?.razaoSocial?.trim() || base.prestadorRazaoSocial,
    prestadorEmail: sanitizeEmail(prest?.email) || base.prestadorEmail,
    dataInicio: req.dataInicio ?? base.dataInicio,
    dataFim: req.dataFim ?? base.dataFim,
    transacao: req.transacao ?? base.transacao,
    inscricaoPrestador: numToStr(rps.inscricaoPrestador) || base.inscricaoPrestador,
    serieRps: rps.serieRps ?? base.serieRps,
    numeroRps: numToStr(rps.numeroRps) || base.numeroRps,
    tipoRps: rps.tipoRPS ?? base.tipoRps,
    dataEmissao: rps.dataEmissao ?? base.dataEmissao,
    statusRps: rps.statusRPS ?? base.statusRps,
    tributacaoRps: rps.tributacaoRPS ?? base.tributacaoRps,
    codigoServico: numToStr(item?.codigoServico) || base.codigoServico,
    discriminacao: item?.discriminacao ?? base.discriminacao,
    valorServicos: formatOptionalNumber(item?.valorServicos),
    valorDeducoes: formatOptionalNumber(item?.valorDeducoes),
    aliquotaServicos: formatOptionalNumber(item?.aliquotaServicos),
    issRetido: item?.issRetido ?? base.issRetido,
    tomadorCpfCnpj: formatDigits(tom?.cpfCnpj) || base.tomadorCpfCnpj,
    tomadorInscricaoMunicipal:
      tom?.inscricaoMunicipal != null ? String(tom.inscricaoMunicipal) : base.tomadorInscricaoMunicipal,
    tomadorInscricaoEstadual:
      tom?.inscricaoEstadual != null ? String(tom.inscricaoEstadual) : base.tomadorInscricaoEstadual,
    tomadorRazaoSocial: tom?.razaoSocial ?? dest?.razaoSocial ?? base.tomadorRazaoSocial,
    tomadorEmail:
      sanitizeEmail(tom?.email) || sanitizeEmail(dest?.email) || base.tomadorEmail,
    ...mapApiEnderecoToTomadorForm(te),
    tributosValorPIS: formatOptionalNumber(trib?.valorPIS),
    tributosValorCOFINS: formatOptionalNumber(trib?.valorCOFINS),
    tributosValorINSS: formatOptionalNumber(trib?.valorINSS),
    tributosValorIR: formatOptionalNumber(trib?.valorIR),
    tributosValorCSLL: formatOptionalNumber(trib?.valorCSLL),
    tributosValorIPI: formatOptionalNumber(trib?.valorIPI),
    tributosValorCargaTributaria: formatOptionalNumber(trib?.valorCargaTributaria),
    tributosPercentualCargaTributaria: formatOptionalNumber(trib?.percentualCargaTributaria),
    tributosFonteCargaTributaria: trib?.fonteCargaTributaria?.trim() ?? base.tributosFonteCargaTributaria,
    tributosValorTotalRecebido: formatOptionalNumber(trib?.valorTotalRecebido),
    tributosValorFinalCobrado: formatOptionalNumber(trib?.valorFinalCobrado),
    tributosValorMulta: formatOptionalNumber(trib?.valorMulta),
    tributosValorJuros: formatOptionalNumber(trib?.valorJuros),
    tributosNcm: trib?.ncm?.trim() ?? base.tributosNcm,
    ibsFinNFSe: ibs?.finNFSe != null ? String(ibs.finNFSe) : base.ibsFinNFSe,
    ibsIndFinal: ibs?.indFinal != null ? String(ibs.indFinal) : base.ibsIndFinal,
    ibsCIndOp: ibs?.cIndOp?.trim() ?? base.ibsCIndOp,
    ibsTpOper: ibs?.tpOper?.trim() ?? '',
    ibsRefNfSe: Array.isArray(ibs?.refNfSe) ? ibs.refNfSe.join('\n') : base.ibsRefNfSe,
    ibsTpEnteGov: ibs?.tpEnteGov?.trim() ?? '',
    ibsIndDest: ibs?.indDest != null ? String(ibs.indDest) : base.ibsIndDest,
    ibsDestNif: dest?.nif != null ? String(dest.nif) : '',
    ibsDestNaoNif: dest?.naoNif != null ? String(dest.naoNif) : '',
    ibsCClassTrib: ibs?.cClassTrib?.trim() ?? base.ibsCClassTrib,
    ibsCClassTribReg: ibs?.cClassTribReg?.trim() ?? '',
    ibsNbs: ibs?.nbs?.trim() ?? '',
    ibsCLocPrestacao: ibs?.cLocPrestacao != null ? String(ibs.cLocPrestacao) : '',
    ibsImovelInscricaoImobiliariaFiscal: imovel?.inscricaoImobiliariaFiscal?.trim() ?? '',
    ibsImovelCCib: imovel?.cCib?.trim() ?? '',
    ibsImovelCObra: imovel?.cObra?.trim() ?? '',
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
          valorServicos: parseDecimal(value.valorServicos),
          valorDeducoes: parseDecimal(value.valorDeducoes),
          aliquotaServicos: parseDecimal(value.aliquotaServicos),
          issRetido: value.issRetido,
        },
        tomador: {
          cpfCnpj: normalizeNumeric(value.tomadorCpfCnpj),
          razaoSocial: value.tomadorRazaoSocial.trim(),
          email: value.tomadorEmail.trim(),
          endereco: {
            tipoLogradouro: normalizeNullableText(value.enderecoTipoLogradouro),
            logradouro: value.enderecoLogradouro.trim(),
            numero: value.enderecoNumero.trim(),
            complemento: normalizeNullableText(value.enderecoComplemento),
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

export function mapFormToProcessarRpsRequest(value: EmissaoRpsTesteFormValue): ProcessarRpsRequest {
  const tomadorEndereco = {
    tipoLogradouro: normalizeNullableText(value.enderecoTipoLogradouro),
    logradouro: value.enderecoLogradouro.trim(),
    numero: value.enderecoNumero.trim(),
    complemento: normalizeNullableText(value.enderecoComplemento),
    bairro: value.enderecoBairro.trim(),
    codigoMunicipio: Number(normalizeNumeric(value.enderecoCodigoMunicipio)),
    uf: value.enderecoUf.trim().toUpperCase(),
    cep: Number(normalizeNumeric(value.enderecoCep)),
  };

  return {
    prestador: {
      cpfCnpj: normalizeNumeric(value.prestadorCpfCnpj),
      inscricaoMunicipal: Number(normalizeNumeric(value.prestadorInscricaoMunicipal)),
      razaoSocial: value.prestadorRazaoSocial.trim(),
      email: value.prestadorEmail.trim(),
      endereco: {
        tipoLogradouro: normalizeNullableText(value.prestadorTipoLogradouro),
        logradouro: value.prestadorLogradouro.trim(),
        numero: value.prestadorNumero.trim(),
        complemento: normalizeNullableText(value.prestadorComplemento),
        bairro: value.prestadorBairro.trim(),
        codigoMunicipio: Number(normalizeNumeric(value.prestadorCodigoMunicipio)),
        uf: value.prestadorUf.trim().toUpperCase(),
        cep: Number(normalizeNumeric(value.prestadorCep)),
      },
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
          valorServicos: parseDecimal(value.valorServicos),
          valorDeducoes: parseDecimal(value.valorDeducoes),
          aliquotaServicos: parseDecimal(value.aliquotaServicos),
          issRetido: value.issRetido,
        },
        tomador: {
          cpfCnpj: normalizeNumeric(value.tomadorCpfCnpj),
          inscricaoMunicipal: normalizeOptionalNumeric(value.tomadorInscricaoMunicipal),
          inscricaoEstadual: normalizeOptionalNumeric(value.tomadorInscricaoEstadual),
          razaoSocial: value.tomadorRazaoSocial.trim(),
          email: value.tomadorEmail.trim(),
          endereco: tomadorEndereco,
        },
        tributos: {
          valorPIS: parseDecimal(value.tributosValorPIS),
          valorCOFINS: parseDecimal(value.tributosValorCOFINS),
          valorINSS: parseDecimal(value.tributosValorINSS),
          valorIR: parseDecimal(value.tributosValorIR),
          valorCSLL: parseDecimal(value.tributosValorCSLL),
          valorIPI: parseDecimal(value.tributosValorIPI),
          valorCargaTributaria: parseDecimal(value.tributosValorCargaTributaria),
          percentualCargaTributaria: parseDecimal(value.tributosPercentualCargaTributaria),
          fonteCargaTributaria: value.tributosFonteCargaTributaria.trim(),
          valorTotalRecebido: parseDecimal(value.tributosValorTotalRecebido),
          valorFinalCobrado: parseDecimal(value.tributosValorFinalCobrado),
          valorMulta: parseDecimal(value.tributosValorMulta),
          valorJuros: parseDecimal(value.tributosValorJuros),
          ncm: value.tributosNcm.trim(),
        },
        ibsCbs: {
          finNFSe: Number(normalizeNumeric(value.ibsFinNFSe)),
          indFinal: Number(normalizeNumeric(value.ibsIndFinal)),
          cIndOp: value.ibsCIndOp.trim(),
          tpOper: normalizeNullableText(value.ibsTpOper),
          refNfSe: value.ibsRefNfSe
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
          tpEnteGov: normalizeNullableText(value.ibsTpEnteGov),
          indDest: Number(normalizeNumeric(value.ibsIndDest)),
          dest: {
            cpfCnpj: normalizeNumeric(value.tomadorCpfCnpj),
            nif: normalizeNullableText(value.ibsDestNif),
            naoNif: normalizeNullableText(value.ibsDestNaoNif),
            razaoSocial: value.tomadorRazaoSocial.trim(),
            email: value.tomadorEmail.trim(),
            endereco: tomadorEndereco,
          },
          cClassTrib: value.ibsCClassTrib.trim(),
          cClassTribReg: value.ibsCClassTribReg.trim(),
          nbs: value.ibsNbs.trim(),
          cLocPrestacao: Number(normalizeNumeric(value.ibsCLocPrestacao)),
          imovelObra: {
            inscricaoImobiliariaFiscal: normalizeNullableText(value.ibsImovelInscricaoImobiliariaFiscal),
            cCib: normalizeNullableText(value.ibsImovelCCib),
            cObra: normalizeNullableText(value.ibsImovelCObra),
            endereco: tomadorEndereco,
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

function normalizeOptionalNumeric(value: string): number | null {
  const normalized = normalizeNumeric(value);
  return normalized ? Number(normalized) : null;
}

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseDecimal(value: string): number {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  const sanitized = normalized.replace(/\s|R\$/g, '');

  if (sanitized.includes(',') && sanitized.includes('.')) {
    return Number(sanitized.replace(/\./g, '').replace(',', '.'));
  }

  if (sanitized.includes(',')) {
    return Number(sanitized.replace(',', '.'));
  }

  return Number(sanitized);
}

function mapApiEnderecoToPrestadorForm(
  e: RpsArquivoEnderecoPayload | null,
): Partial<EmissaoRpsTesteFormValue> {
  if (!e) {
    return {};
  }

  return {
    prestadorTipoLogradouro: e.tipoLogradouro ?? '',
    prestadorLogradouro: e.logradouro ?? '',
    prestadorNumero: e.numero ?? '',
    prestadorComplemento: e.complemento ?? '',
    prestadorBairro: e.bairro ?? '',
    prestadorCodigoMunicipio: e.codigoMunicipio != null ? String(e.codigoMunicipio) : '',
    prestadorUf: e.uf ?? '',
    prestadorCep: e.cep != null ? String(e.cep) : '',
  };
}

function mapApiEnderecoToTomadorForm(
  e: RpsArquivoEnderecoPayload | null,
): Partial<EmissaoRpsTesteFormValue> {
  if (!e) {
    return {};
  }

  return {
    enderecoTipoLogradouro: e.tipoLogradouro ?? '',
    enderecoLogradouro: e.logradouro ?? '',
    enderecoNumero: e.numero ?? '',
    enderecoComplemento: e.complemento ?? '',
    enderecoBairro: e.bairro ?? '',
    enderecoCodigoMunicipio: e.codigoMunicipio != null ? String(e.codigoMunicipio) : '',
    enderecoUf: e.uf ?? '',
    enderecoCep: e.cep != null ? String(e.cep) : '',
  };
}

function formatDigits(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.replace(/\D/g, '');
}

function numToStr(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function formatOptionalNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function sanitizeEmail(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.replace(/^\s+/, '').replace(/^\t+/, '').trim();
}
