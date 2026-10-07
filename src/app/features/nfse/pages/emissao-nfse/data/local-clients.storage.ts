import type { TomadorRequest, TomadorResponse } from '../../../data-access/models/nfse-api.models';
import type { EmissaoRpsTesteFormValue } from '../models/emissao-rps-teste.models';

/** Cadastro local de prestador (endereco + identificacao). CNPJ pode ficar vazio se vier so do certificado. */
export interface PrestadorTemplate {
  cnpj: string;
  inscricaoMunicipal: string;
  razaoSocial: string;
  email: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  codigoMunicipio: string;
  uf: string;
  cep: string;
}

export const PRESTADORES_STORAGE: readonly PrestadorTemplate[] = [
  {
    cnpj: '02.126.914/0001-29',
    inscricaoMunicipal: '3.768.428-0',
    razaoSocial: 'MICROLED INFORMATICA E SERVICOS LTDA',
    email: 'ipsilva@microled.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'IRAI',
    numero: '00075',
    complemento: 'CJ 21 TORRE A',
    bairro: 'INDIANOPOLIS',
    codigoMunicipio: '3550308',
    uf: 'SP',
    cep: '04082-000',
  },
  {
    cnpj: '09.218.626/0001-43',
    inscricaoMunicipal: '3.698.180-0',
    razaoSocial: 'SP LOGICA SISTEMAS E CONSULTORIA LTDA',
    email: 'ipsilva@microled.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'IRAI',
    numero: '00075',
    complemento: 'CJ 21 TORRE A',
    bairro: 'INDIANOPOLIS',
    codigoMunicipio: '3550308',
    uf: 'SP',
    cep: '04082-000',
  },
  {
    cnpj: '64.777.773/0001-61',
    inscricaoMunicipal: '01555553',
    razaoSocial: 'KLEITON EDUARDO DA SILVA FREITAS CONSULTORIA EM TECNOLOGIA..',
    email: 'kleiton.freitas@kleiton.com.br',
    tipoLogradouro: 'RUA',
    logradouro: 'PAIS LEME',
    numero: '215',
    complemento: 'CONJ 1713',
    bairro: 'PINHEIROS',
    codigoMunicipio: '3550308',
    uf: 'SP',
    cep: '05424-150',
  }
];

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

const MIN_CNPJ_QUERY_LEN = 3;
const MIN_RAZAO_QUERY_LEN = 2;

function normalizeRazaoCompare(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Texto digitado contem o cadastro, ou o cadastro contem o texto (ex.: razao longa vinda do certificado). */
function prestadorRazaoMatchesQuery(pr: string, r: string): boolean {
  if (r.length >= MIN_RAZAO_QUERY_LEN && pr.includes(r)) {
    return true;
  }
  if (pr.length >= MIN_RAZAO_QUERY_LEN && r.includes(pr)) {
    return true;
  }
  return false;
}

export function filterPrestadores(cnpjInput: string, razaoInput: string): PrestadorTemplate[] {
  const d = normalizeDigits(cnpjInput);
  const r = normalizeRazaoCompare(razaoInput);
  if (d.length < MIN_CNPJ_QUERY_LEN && r.length < MIN_RAZAO_QUERY_LEN) {
    return [];
  }

  return PRESTADORES_STORAGE.filter((p) => {
    const pd = normalizeDigits(p.cnpj);
    const pr = normalizeRazaoCompare(p.razaoSocial);
    const byCnpj =
      d.length >= MIN_CNPJ_QUERY_LEN && pd.length > 0 && (pd.includes(d) || d.includes(pd));
    const byRazao = prestadorRazaoMatchesQuery(pr, r);
    return byCnpj || byRazao;
  });
}

/**
 * Quando CNPJ/razao batem com um unico prestador no cadastro local (ex.: apos preencher pelo certificado).
 * Casos ambiguos retornam null para nao sobrescrever escolha do usuario.
 */
export function resolveUniquePrestadorTemplate(cnpjInput: string, razaoInput: string): PrestadorTemplate | null {
  const matches = filterPrestadores(cnpjInput, razaoInput);
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  const d = normalizeDigits(cnpjInput);
  if (d.length >= 14) {
    const byFullCnpj = matches.filter((p) => normalizeDigits(p.cnpj) === d);
    if (byFullCnpj.length === 1) {
      return byFullCnpj[0];
    }
  }
  const r = normalizeRazaoCompare(razaoInput);
  if (r.length > 0) {
    const byExactRazao = matches.filter((p) => normalizeRazaoCompare(p.razaoSocial) === r);
    if (byExactRazao.length === 1) {
      return byExactRazao[0];
    }
  }
  return null;
}

export function prestadorTemplateToFormPatch(p: PrestadorTemplate): Partial<EmissaoRpsTesteFormValue> {
  const cnpjDigits = normalizeDigits(p.cnpj);
  const imDigits = normalizeDigits(p.inscricaoMunicipal);
  const patch: Partial<EmissaoRpsTesteFormValue> = {
    prestadorInscricaoMunicipal: p.inscricaoMunicipal.trim(),
    prestadorRazaoSocial: p.razaoSocial.trim(),
    prestadorEmail: p.email.trim(),
    prestadorTipoLogradouro: p.tipoLogradouro.trim(),
    prestadorLogradouro: p.logradouro.trim(),
    prestadorNumero: p.numero.trim(),
    prestadorComplemento: p.complemento.trim(),
    prestadorBairro: p.bairro.trim(),
    prestadorCodigoMunicipio: p.codigoMunicipio.trim(),
    prestadorUf: p.uf.trim().toUpperCase(),
    prestadorCep: normalizeDigits(p.cep),
    inscricaoPrestador: imDigits || p.inscricaoMunicipal.trim(),
  };

  if (cnpjDigits.length > 0) {
    patch.prestadorCpfCnpj = cnpjDigits;
  }

  return patch;
}

export function tomadorToFormPatch(t: TomadorResponse): Partial<EmissaoRpsTesteFormValue> {
  return {
    tomadorCpfCnpj: normalizeDigits(t.cpfCnpj),
    tomadorInscricaoMunicipal: t.inscricaoMunicipal ?? '',
    tomadorInscricaoEstadual: t.inscricaoEstadual ?? '',
    tomadorRazaoSocial: t.razaoSocial,
    tomadorEmail: t.email ?? '',
    enderecoTipoLogradouro: t.tipoLogradouro ?? '',
    enderecoLogradouro: t.logradouro ?? '',
    enderecoNumero: t.numero ?? '',
    enderecoComplemento: t.complemento ?? '',
    enderecoBairro: t.bairro ?? '',
    enderecoUf: (t.uf ?? '').toUpperCase(),
    enderecoCodigoMunicipio: t.codigoMunicipio ?? '',
    enderecoCep: normalizeDigits(t.cep ?? ''),
  };
}

export function formToTomadorRequest(form: EmissaoRpsTesteFormValue): TomadorRequest {
  return {
    cpfCnpj: normalizeDigits(form.tomadorCpfCnpj),
    razaoSocial: form.tomadorRazaoSocial.trim(),
    inscricaoMunicipal: form.tomadorInscricaoMunicipal,
    inscricaoEstadual: form.tomadorInscricaoEstadual,
    email: form.tomadorEmail,
    tipoLogradouro: form.enderecoTipoLogradouro,
    logradouro: form.enderecoLogradouro,
    numero: form.enderecoNumero,
    complemento: form.enderecoComplemento,
    bairro: form.enderecoBairro,
    uf: form.enderecoUf,
    codigoMunicipio: form.enderecoCodigoMunicipio,
    cep: form.enderecoCep,
  };
}

/** Razao social padrao gravada pelo leitor do Access quando o RPS nao traz o nome do tomador. */
const TOMADOR_RAZAO_PLACEHOLDER = 'TOMADOR';

function isBlankOrZero(value: string | null | undefined): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed === '' || /^0+$/.test(trimmed);
}

/**
 * Completa os campos do tomador que vieram vazios/zerados (ex.: RPS do Access sem endereco)
 * com os dados do cadastro de tomadores. Campos ja preenchidos no RPS sao mantidos.
 */
export function mergeTomadorCadastroIntoForm(
  form: EmissaoRpsTesteFormValue,
  tomador: TomadorResponse,
): EmissaoRpsTesteFormValue {
  const result: Record<string, unknown> = { ...form };
  for (const [key, value] of Object.entries(tomadorToFormPatch(tomador))) {
    if (typeof value !== 'string' || isBlankOrZero(value)) {
      continue;
    }
    const current = String(result[key] ?? '');
    const isPlaceholder =
      key === 'tomadorRazaoSocial' && current.trim().toUpperCase() === TOMADOR_RAZAO_PLACEHOLDER;
    if (isBlankOrZero(current) || isPlaceholder) {
      result[key] = value;
    }
  }
  return result as unknown as EmissaoRpsTesteFormValue;
}

/**
 * Campos de endereco do tomador exigidos pela prefeitura de SP. O mesmo endereco vai no
 * destinatario do IBS/CBS (erros 251 bairro, 252 logradouro, 253 numero) e Cidade/CEP nao
 * podem ser 0 (erro 1001 tpCidade/tpCEP).
 */
const TOMADOR_ENDERECO_OBRIGATORIO: readonly [keyof EmissaoRpsTesteFormValue, string][] = [
  ['enderecoLogradouro', 'Logradouro'],
  ['enderecoNumero', 'Numero'],
  ['enderecoBairro', 'Bairro'],
  ['enderecoCodigoMunicipio', 'Codigo municipio'],
  ['enderecoUf', 'UF'],
  ['enderecoCep', 'CEP'],
];

/** Lista os campos obrigatorios do endereco do tomador que estao vazios/zerados. */
export function getTomadorEnderecoPendencias(form: EmissaoRpsTesteFormValue): string[] {
  return TOMADOR_ENDERECO_OBRIGATORIO.filter(([key]) => isBlankOrZero(String(form[key] ?? ''))).map(
    ([, label]) => label,
  );
}
