export type QueryParamValue = string | number | boolean | Date | null | undefined;

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NfseApiErrorDetails {
  code?: string;
  fields?: Record<string, string[]>;
  raw?: unknown;
}

export class NfseApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: NfseApiErrorDetails,
  ) {
    super(message);
    this.name = 'NfseApiError';
  }
}

export interface NfseQueryFilters {
  page?: number;
  pageSize?: number;
  dataInicial?: string;
  dataFinal?: string;
  status?: string;
  numeroNfse?: string;
  numeroRps?: string;
  serieRps?: string;
  inscricaoPrestador?: string;
  inscricaoTomador?: string;
  cnpjCpfTomador?: string;
  competencia?: string;
  protocolo?: string;
  [key: string]: QueryParamValue;
}

export interface NfseResumoResponse {
  numeroNfse: string;
  codigoVerificacao?: string;
  numeroRps?: string;
  serieRps?: string;
  inscricaoPrestador?: string;
  inscricaoTomador?: string;
  cnpjCpfPrestador?: string;
  cnpjCpfTomador?: string;
  competencia?: string;
  dataEmissao?: string;
  status?: string;
  valorLiquido?: number;
  valorServicos?: number;
}

export interface NfseDetalheResponse extends NfseResumoResponse {
  discriminacao?: string;
  prestador?: Record<string, unknown>;
  tomador?: Record<string, unknown>;
  servico?: Record<string, unknown>;
}

export interface ConsultaNfsePorRpsRequest {
  inscricaoPrestador: string;
  serieRps: string;
  numeroRps: string;
}

export interface LoteResumoResponse {
  numeroLote: string;
  protocolo?: string;
  status?: string;
  dataRecebimento?: string;
  quantidadeRps?: number;
}

export interface LoteInformacoesResponse extends LoteResumoResponse {
  inscricaoPrestador: string;
  mensagens?: string[];
  notasGeradas?: NfseResumoResponse[];
}

export interface CnpjConsultaResponse {
  cnpj: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacao?: string;
  municipio?: string;
  uf?: string;
}

export interface CertificateResponse {
  thumbprint: string;
  subject: string;
  issuer: string;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  hasPrivateKey: boolean;
  storeLocation: string;
  storeName: string;
  simpleName: string;
  cnpj: string | null;
  cpf: string | null;
  isA3Candidate: boolean;
  isCurrentlySelected: boolean;
}

export interface SelectCertificatePayload {
  thumbprint: string;
  storeLocation: string;
  storeName: string;
}

export interface ChaveNfeRequest {
  inscricaoPrestador: number;
  numeroNFe: number;
  codigoVerificacao: string;
  chaveNotaNacional: string | null;
}

export interface ConsultarNotaFiscalRequest {
  chaveNFe: ChaveNfeRequest;
}

export interface ChaveNfeResponse {
  inscricaoPrestador?: number | string;
  numeroNFe?: number | string;
  codigoVerificacao?: string;
  chaveNotaNacional?: string | null;
}

export interface NotaFiscalConsultaItemResponse {
  chaveNFe?: ChaveNfeResponse;
  dataEmissao?: string;
  dataFatoGerador?: string;
  status?: string;
  valorTotal?: number;
  valorServicos?: number;
  valorDeducoes?: number;
  valorISS?: number;
  valorLiquido?: number;
  prestador?: Record<string, unknown>;
  tomador?: Record<string, unknown>;
  servico?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConsultarNotaFiscalResponse {
  sucesso: boolean;
  nFeList: NotaFiscalConsultaItemResponse[];
  alertas: string[];
  erros: string[];
}

export interface EnderecoPayload {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
}

export interface PessoaPayload {
  nomeRazaoSocial: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  inscricaoMunicipal?: string;
  endereco?: EnderecoPayload;
}

export interface ServicoPayload {
  itemListaServico: string;
  codigoTributacaoMunicipio?: string;
  discriminacao: string;
  valorServicos: number;
  valorDeducoes?: number;
  valorPis?: number;
  valorCofins?: number;
  valorInss?: number;
  valorIr?: number;
  valorCsll?: number;
  issRetido?: boolean;
  aliquota?: number;
  codigoMunicipioIncidencia?: string;
}

export interface EmitirRpsPayload {
  inscricaoPrestador: string;
  serieRps: string;
  numeroRps: string;
  dataEmissao: string;
  competencia?: string;
  naturezaOperacao?: string;
  regimeEspecialTributacao?: string;
  optanteSimplesNacional?: boolean;
  incentivadorCultural?: boolean;
  status?: string;
  prestador?: PessoaPayload;
  tomador: PessoaPayload;
  servico: ServicoPayload;
}

export interface EmitirLotePayload {
  numeroLote: string;
  inscricaoPrestador: string;
  quantidadeRps: number;
  rps: EmitirRpsPayload[];
}

export interface CancelarNfsePayload {
  numeroNfse: string;
  inscricaoPrestador: string;
  codigoCancelamento?: string;
  motivoCancelamento: string;
}

export interface OperacaoNfseResponse {
  sucesso: boolean;
  mensagem: string;
  protocolo?: string;
  numeroNfse?: string;
  numeroLote?: string;
}
