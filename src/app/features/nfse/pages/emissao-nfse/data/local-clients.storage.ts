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
  {
    cnpj: '02.126.914/0001-29',
    inscricaoMunicipal: '3.768.428-0',
    inscricaoEstadual: '',
    razaoSocial: 'MICROLED INFORMATICA E SERVICOS LTDA',
    email: 'ipsilva@microled.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'IRAI',
    numero: '00075',
    complemento: 'CJ 21 TORRE A',
    bairro: 'INDIANOPOLIS',
    uf: 'SP',
    codigoMunicipio: '3550308',
    cep: '04082-000',
  },
  {
    cnpj: '09.218.626/0001-43',
    inscricaoMunicipal: '3.698.180-0',
    inscricaoEstadual: '',
    razaoSocial: 'SPLOGICA SISTEMAS E CONSULTORIA LTDA',
    email: 'ipsilva@microled.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'IRAI',
    numero: '00075',
    complemento: 'CJ 21 TORRE A',
    bairro: 'INDIANOPOLIS',
    uf: 'SP',
    codigoMunicipio: '3550308',
    cep: '04082-000',
  },
  {
    cnpj: '53.730.495/0001-70',
    inscricaoMunicipal: '3.698.180-0',
    inscricaoEstadual: '',
    razaoSocial: 'TERMARES TERMINAIS MARITIMOS ESPECIALIZADOS LTDA',
    email: 'administrativoti.op@ecoportosantos.com.br',
    tipoLogradouro: 'AV',
    logradouro: 'C DO SABOO, S/N',
    numero: 'S/N',
    complemento: 'CAIS PATIO 1 2 E 3',
    bairro: 'SABOO',
    uf: 'SP',
    codigoMunicipio: '3550308',
    cep: '11010-970',
  },
  {
    cnpj: '45.455.869/0001-69',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    razaoSocial: 'M6 CARGO LOGISTICA LTDA',
    email: 'FISCAL@TECNOCONTABILIDADE.COM.BR',
    tipoLogradouro: 'PC',
    logradouro: 'PC REPUBLICA',
    numero: 'S/N',
    complemento: 'SALA 42',
    bairro: 'CENTRO',
    uf: 'SP',
    codigoMunicipio: '3550308',
    cep: '11.013-922',
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
