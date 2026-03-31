import { CertificateResponse } from '../../../data-access/models/nfse-api.models';

export interface ConfiguracoesNfseFormValue {
  empresaNome: string;
  cnpj: string;
  cpf: string;
  inscricaoMunicipal: string;
  thumbprint: string;
  certificadoNome: string;
  emissorCertificado: string;
  serialNumber: string;
  storeLocation: string;
  storeName: string;
  validadeInicial: string;
  validadeFinal: string;
  ambiente: string;
}

export function mapCertificateToConfiguracoesFormValue(
  certificate: CertificateResponse,
): ConfiguracoesNfseFormValue {
  return {
    empresaNome: certificate.simpleName,
    cnpj: certificate.cnpj ?? '',
    cpf: certificate.cpf ?? '',
    inscricaoMunicipal: '',
    thumbprint: certificate.thumbprint,
    certificadoNome: certificate.simpleName,
    emissorCertificado: certificate.issuer,
    serialNumber: certificate.serialNumber,
    storeLocation: certificate.storeLocation,
    storeName: certificate.storeName,
    validadeInicial: certificate.notBefore,
    validadeFinal: certificate.notAfter,
    ambiente: 'producao',
  };
}
