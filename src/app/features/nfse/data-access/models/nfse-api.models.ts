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
  inscricaoMunicipal?: string | number | null;
  razaoSocial?: string | null;
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

export interface CancelarNotaFiscalRequest {
  chaveNFe: ChaveNfeRequest;
  transacao: boolean;
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
  notaXml?: string;
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

export interface CancelarNotaFiscalResponse {
  sucesso: boolean;
  mensagem?: string;
  protocolo?: string | null;
  alertas?: string[];
  erros?: string[];
  [key: string]: unknown;
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

export interface RpsArquivoPrestadorPayload {
  cpfCnpj: string;
  inscricaoMunicipal: number;
  razaoSocial: string;
}

export interface RpsArquivoEnderecoPayload {
  tipoLogradouro?: string | null;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  codigoMunicipio: number;
  uf: string;
  cep: number;
}

export interface RpsArquivoItemPayload {
  codigoServico: number;
  discriminacao: string;
  valorServicos: number;
  valorDeducoes: number;
  aliquotaServicos: number;
  issRetido: boolean;
}

export interface RpsArquivoTomadorPayload {
  cpfCnpj: string;
  razaoSocial: string;
  email: string;
  endereco: RpsArquivoEnderecoPayload;
}

export interface RpsArquivoItemRpsPayload {
  inscricaoPrestador: number;
  serieRps: string;
  numeroRps: number;
  tipoRPS: string;
  dataEmissao: string;
  statusRPS: string;
  tributacaoRPS: string;
  item: RpsArquivoItemPayload;
  tomador: RpsArquivoTomadorPayload;
}

export interface GerarArquivoRpsRequest {
  prestador: RpsArquivoPrestadorPayload;
  rpsList: RpsArquivoItemRpsPayload[];
  dataInicio: string;
  dataFim: string;
  transacao: boolean;
}

export interface ProcessarRpsPrestadorPayload extends RpsArquivoPrestadorPayload {
  email: string;
  endereco: RpsArquivoEnderecoPayload;
}

export interface ProcessarRpsTomadorPayload extends RpsArquivoTomadorPayload {
  inscricaoMunicipal: string | number | null;
  inscricaoEstadual: string | number | null;
}

export interface ProcessarRpsTributosPayload {
  valorPIS: number;
  valorCOFINS: number;
  valorINSS: number;
  valorIR: number;
  valorCSLL: number;
  valorIPI: number;
  valorCargaTributaria: number;
  percentualCargaTributaria: number;
  fonteCargaTributaria: string;
  valorTotalRecebido: number;
  valorFinalCobrado: number;
  valorMulta: number;
  valorJuros: number;
  ncm: string;
}

export interface ProcessarRpsIbsCbsDestPayload {
  cpfCnpj: string;
  nif: string | null;
  naoNif: string | null;
  razaoSocial: string;
  email: string;
  endereco: RpsArquivoEnderecoPayload;
}

export interface ProcessarRpsIbsCbsImovelObraPayload {
  inscricaoImobiliariaFiscal: string | null;
  cCib: string | null;
  cObra: string | null;
  endereco: RpsArquivoEnderecoPayload;
}

export interface ProcessarRpsIbsCbsPayload {
  finNFSe: number;
  indFinal: number;
  cIndOp: string;
  tpOper: string | null;
  refNfSe: string[];
  tpEnteGov: string | null;
  indDest: number;
  dest: ProcessarRpsIbsCbsDestPayload;
  cClassTrib: string;
  cClassTribReg: string;
  nbs: string;
  cLocPrestacao: number;
  imovelObra: ProcessarRpsIbsCbsImovelObraPayload;
}

export interface ProcessarRpsItemRpsPayload extends RpsArquivoItemRpsPayload {
  tomador: ProcessarRpsTomadorPayload;
  tributos: ProcessarRpsTributosPayload;
  ibsCbs: ProcessarRpsIbsCbsPayload;
}

export interface ProcessarRpsRequest {
  prestador: ProcessarRpsPrestadorPayload;
  rpsList: ProcessarRpsItemRpsPayload[];
  dataInicio: string;
  dataFim: string;
  transacao: boolean;
}

export interface GerarArquivoRpsResponse {
  success: boolean;
  isSentToWebService: boolean;
  localFilePath: string | null;
  soapFilePath: string | null;
  protocol: string | null;
  message: string;
  warnings: string[];
  errors: string[];
  nfeRpsKeys: string[];
}

export interface ProcessarRpsResponse {
  success: boolean;
  isSentToWebService: boolean;
  localFilePath: string | null;
  soapFilePath: string | null;
  protocol: string | null;
  message: string;
  warnings: string[];
  errors: string[];
  nfeRpsKeys: string[];
}

/** Item de `rpsList` no retorno de GET /api/local/access/pending-rps (API pode enviar nulls). */
export interface PendingRpsApiItem {
  inscricaoPrestador?: number;
  serieRps?: string;
  numeroRps?: number;
  tipoRPS?: string;
  dataEmissao?: string;
  statusRPS?: string;
  tributacaoRPS?: string;
  item?: {
    codigoServico?: number;
    discriminacao?: string;
    valorServicos?: number;
    valorDeducoes?: number;
    aliquotaServicos?: number;
    issRetido?: boolean;
  };
  tomador?: {
    cpfCnpj?: string;
    inscricaoMunicipal?: number | null;
    inscricaoEstadual?: number | null;
    razaoSocial?: string;
    email?: string | null;
    endereco?: RpsArquivoEnderecoPayload | null;
  };
  tributos?: {
    valorPIS?: number | null;
    valorCOFINS?: number | null;
    valorINSS?: number | null;
    valorIR?: number | null;
    valorCSLL?: number | null;
    valorIPI?: number | null;
    valorCargaTributaria?: number | null;
    percentualCargaTributaria?: number | null;
    fonteCargaTributaria?: string | null;
    valorTotalRecebido?: number | null;
    valorFinalCobrado?: number | null;
    valorMulta?: number | null;
    valorJuros?: number | null;
    ncm?: string | null;
  };
  ibsCbs?: {
    finNFSe?: number | null;
    indFinal?: number | null;
    cIndOp?: string | null;
    tpOper?: string | null;
    refNfSe?: string[] | null;
    tpEnteGov?: string | null;
    indDest?: number | null;
    dest?: {
      cpfCnpj?: string;
      nif?: string | null;
      naoNif?: string | null;
      razaoSocial?: string;
      email?: string | null;
      endereco?: RpsArquivoEnderecoPayload | null;
    };
    cClassTrib?: string | null;
    cClassTribReg?: string | null;
    nbs?: string | null;
    cLocPrestacao?: number | null;
    imovelObra?: ProcessarRpsIbsCbsImovelObraPayload | null;
  };
}

export interface PendingRpsApiRequest {
  prestador?: {
    cpfCnpj?: string;
    inscricaoMunicipal?: number;
    razaoSocial?: string;
    email?: string | null;
    endereco?: RpsArquivoEnderecoPayload | null;
  };
  rpsList?: PendingRpsApiItem[];
  dataInicio?: string;
  dataFim?: string;
  transacao?: boolean;
}

export interface PendingRpsResponse {
  count: number;
  recordIds: number[];
  request: PendingRpsApiRequest | null;
}

export interface ConsultarStatusRpsRequest {
  numeroProtocolo: string;
  cnpjRemetente: string;
}

export interface ConsultarStatusRpsResponse {
  sucesso: boolean;
  situacaoCodigo: number | null;
  situacaoNome: string | null;
  numeroLote: number | string | null;
  dataRecebimento: string | null;
  dataProcessamento: string | null;
  resultadoOperacao: string | null;
  erros: string[];
}
