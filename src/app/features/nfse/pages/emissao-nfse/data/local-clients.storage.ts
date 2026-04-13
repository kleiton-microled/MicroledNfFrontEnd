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

export interface TomadorTemplate {
  cnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  razaoSocial: string;
  email: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  uf: string;
  codigoMunicipio: string;
  cep: string;
}

export const PRESTADORES_STORAGE: readonly PrestadorTemplate[] = [
  {
    cnpj: '',
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
    cnpj: '64.777.773/0001-61',
    inscricaoMunicipal: '',
    razaoSocial: 'KLEITON EDUARDO DA SILVA FREITAS CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA',
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

export const TOMADORES_STORAGE: readonly TomadorTemplate[] = [
  {
    cnpj: '58.138.058/0031-00',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    razaoSocial: 'EUDMARCO S/A SERVICOS E COMERCIO INTERNACIONAL',
    email: 'xml@abainfra.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'Senador Dantas',
    numero: '206',
    complemento: '',
    bairro: 'Macuco',
    uf: 'SP',
    codigoMunicipio: '3548500',
    cep: '11015-300',
  },
  {
    cnpj: '02.390.435/0001-15',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    razaoSocial: 'ECOPORTO SANTOS S/A',
    email: 'administrativoti.op@ecoportosantos.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'ENGENHEIRO ALVES FREIRE',
    numero: 'S/Nº',
    complemento: '',
    bairro: 'CAIS SABOO',
    uf: 'SP',
    codigoMunicipio: '3548500',
    cep: '11010-230',
  },
];

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

const MIN_CNPJ_QUERY_LEN = 3;
const MIN_RAZAO_QUERY_LEN = 2;

export function filterPrestadores(cnpjInput: string, razaoInput: string): PrestadorTemplate[] {
  const d = normalizeDigits(cnpjInput);
  const r = razaoInput.trim().toLowerCase();
  if (d.length < MIN_CNPJ_QUERY_LEN && r.length < MIN_RAZAO_QUERY_LEN) {
    return [];
  }

  return PRESTADORES_STORAGE.filter((p) => {
    const pd = normalizeDigits(p.cnpj);
    const pr = p.razaoSocial.toLowerCase();
    const byCnpj =
      d.length >= MIN_CNPJ_QUERY_LEN && pd.length > 0 && (pd.includes(d) || d.includes(pd));
    const byRazao = r.length >= MIN_RAZAO_QUERY_LEN && pr.includes(r);
    return byCnpj || byRazao;
  });
}

export function filterTomadores(cnpjInput: string, razaoInput: string): TomadorTemplate[] {
  const d = normalizeDigits(cnpjInput);
  const r = razaoInput.trim().toLowerCase();
  if (d.length < MIN_CNPJ_QUERY_LEN && r.length < MIN_RAZAO_QUERY_LEN) {
    return [];
  }

  return TOMADORES_STORAGE.filter((p) => {
    const pd = normalizeDigits(p.cnpj);
    const pr = p.razaoSocial.toLowerCase();
    const byCnpj =
      d.length >= MIN_CNPJ_QUERY_LEN && pd.length > 0 && (pd.includes(d) || d.includes(pd));
    const byRazao = r.length >= MIN_RAZAO_QUERY_LEN && pr.includes(r);
    return byCnpj || byRazao;
  });
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

export function tomadorTemplateToFormPatch(t: TomadorTemplate): Partial<EmissaoRpsTesteFormValue> {
  return {
    tomadorCpfCnpj: normalizeDigits(t.cnpj),
    tomadorInscricaoMunicipal: t.inscricaoMunicipal.trim(),
    tomadorInscricaoEstadual: t.inscricaoEstadual.trim(),
    tomadorRazaoSocial: t.razaoSocial.trim(),
    tomadorEmail: t.email.trim(),
    enderecoTipoLogradouro: t.tipoLogradouro.trim(),
    enderecoLogradouro: t.logradouro.trim(),
    enderecoNumero: t.numero.trim(),
    enderecoComplemento: t.complemento.trim(),
    enderecoBairro: t.bairro.trim(),
    enderecoUf: t.uf.trim().toUpperCase(),
    enderecoCodigoMunicipio: t.codigoMunicipio.trim(),
    enderecoCep: normalizeDigits(t.cep),
  };
}
