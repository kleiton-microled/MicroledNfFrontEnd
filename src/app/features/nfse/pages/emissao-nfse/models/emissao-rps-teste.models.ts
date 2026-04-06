import {
  CertificateResponse,
  GerarArquivoRpsRequest,
  NfseSpCalculateTaxesRequest,
  NfseSpCalculateTaxesResponse,
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
  tributosBaseCalculoIss: string;
  tributosBaseCalculoFederal: string;
  tributosValorISS: string;
  tributosTotalRetencoesFederais: string;
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

/** Estado inicial: vazio exceto flags; prestador vem do certificado via `applyCertificateToEmissaoRpsTesteFormValue`. */
export function getDefaultEmissaoRpsTesteFormValue(): EmissaoRpsTesteFormValue {
  return {
    prestadorCpfCnpj: '',
    prestadorInscricaoMunicipal: '',
    prestadorRazaoSocial: '',
    prestadorEmail: '',
    prestadorTipoLogradouro: '',
    prestadorLogradouro: '',
    prestadorNumero: '',
    prestadorComplemento: '',
    prestadorBairro: '',
    prestadorCodigoMunicipio: '',
    prestadorUf: '',
    prestadorCep: '',
    dataInicio: '',
    dataFim: '',
    transacao: true,
    inscricaoPrestador: '',
    serieRps: '',
    numeroRps: '',
    tipoRps: '',
    dataEmissao: '',
    statusRps: '',
    tributacaoRps: '',
    codigoServico: '',
    discriminacao: '',
    valorServicos: '',
    valorDeducoes: '',
    aliquotaServicos: '',
    issRetido: false,
    tomadorCpfCnpj: '',
    tomadorInscricaoMunicipal: '',
    tomadorInscricaoEstadual: '',
    tomadorRazaoSocial: '',
    tomadorEmail: '',
    enderecoTipoLogradouro: '',
    enderecoLogradouro: '',
    enderecoNumero: '',
    enderecoComplemento: '',
    enderecoBairro: '',
    enderecoCodigoMunicipio: '',
    enderecoUf: '',
    enderecoCep: '',
    tributosBaseCalculoIss: '',
    tributosBaseCalculoFederal: '',
    tributosValorISS: '',
    tributosTotalRetencoesFederais: '',
    tributosValorPIS: '',
    tributosValorCOFINS: '',
    tributosValorINSS: '',
    tributosValorIR: '',
    tributosValorCSLL: '',
    tributosValorIPI: '',
    tributosValorCargaTributaria: '',
    tributosPercentualCargaTributaria: '',
    tributosFonteCargaTributaria: '',
    tributosValorTotalRecebido: '',
    tributosValorFinalCobrado: '',
    tributosValorMulta: '',
    tributosValorJuros: '',
    tributosNcm: '',
    ibsFinNFSe: '',
    ibsIndFinal: '',
    ibsCIndOp: '',
    ibsTpOper: '',
    ibsRefNfSe: '',
    ibsTpEnteGov: '',
    ibsIndDest: '',
    ibsDestNif: '',
    ibsDestNaoNif: '',
    ibsCClassTrib: '',
    ibsCClassTribReg: '',
    ibsNbs: '',
    ibsCLocPrestacao: '',
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

/** Campos preenchidos apenas pelo endpoint `calculate-taxes` (formulario: desabilitados). */
export function getEmptyCalculatedTributosFromApiPatch(): Partial<EmissaoRpsTesteFormValue> {
  return {
    tributosBaseCalculoIss: '',
    tributosBaseCalculoFederal: '',
    tributosValorISS: '',
    tributosTotalRetencoesFederais: '',
    tributosValorPIS: '',
    tributosValorCOFINS: '',
    tributosValorINSS: '',
    tributosValorIR: '',
    tributosValorCSLL: '',
    tributosValorFinalCobrado: '',
  };
}

export function validateNfseSpCalculateTaxesInput(value: EmissaoRpsTesteFormValue): string | null {
  if (!value.codigoServico.trim()) {
    return 'Informe o codigo de servico.';
  }

  if (!value.valorServicos.trim()) {
    return 'Informe o valor dos servicos.';
  }

  const valorServico = parseDecimal(value.valorServicos);
  if (Number.isNaN(valorServico)) {
    return 'Valor dos servicos invalido.';
  }

  if (!value.aliquotaServicos.trim()) {
    return 'Informe a aliquota dos servicos.';
  }

  const aliquotaIss = parseDecimal(value.aliquotaServicos);
  if (Number.isNaN(aliquotaIss)) {
    return 'Aliquota dos servicos invalida.';
  }

  return null;
}

export function buildNfseSpCalculateTaxesRequest(
  value: EmissaoRpsTesteFormValue,
): NfseSpCalculateTaxesRequest {
  return {
    valorServico: parseDecimal(value.valorServicos),
    valorDeducoes: 0,
    descontoIncondicional: 0,
    descontoCondicional: 0,
    aliquotaIss: parseDecimal(value.aliquotaServicos),
    issRetido: false,
    codigoServico: value.codigoServico.trim(),
    regimeTributario: 'LucroPresumido',
    baseFederalSobreValorLiquido: true,
    arredondarNaCasaFiscal: true,
  };
}

export function mapNfseSpCalculateTaxesResponseToFormPatch(
  response: NfseSpCalculateTaxesResponse,
): Partial<EmissaoRpsTesteFormValue> {
  return {
    tributosBaseCalculoIss: formatTaxApiNumber(response.baseCalculoIss),
    tributosBaseCalculoFederal: formatTaxApiNumber(response.baseCalculoFederal),
    tributosValorISS: formatTaxApiNumber(response.valorIss),
    tributosValorPIS: formatTaxApiNumber(response.valorPis),
    tributosValorCOFINS: formatTaxApiNumber(response.valorCofins),
    tributosValorINSS: formatTaxApiNumber(response.valorInss),
    tributosValorIR: formatTaxApiNumber(response.valorIr),
    tributosValorCSLL: formatTaxApiNumber(response.valorCsll),
    tributosTotalRetencoesFederais: formatTaxApiNumber(response.totalRetencoesFederais),
    tributosValorFinalCobrado: formatTaxApiNumber(response.valorLiquido),
  };
}

function formatTaxApiNumber(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }

  return String(value);
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

/** Geracao de arquivo RPS usa o mesmo payload do envio da nota (tributos e IBS/CBS incluidos). */
export function mapFormToGerarArquivoRpsRequest(
  value: EmissaoRpsTesteFormValue,
): GerarArquivoRpsRequest {
  return mapFormToProcessarRpsRequest(value);
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
