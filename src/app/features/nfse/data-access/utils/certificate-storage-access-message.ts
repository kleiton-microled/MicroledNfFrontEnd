/** Mensagem exibida quando o agente local nao consegue ler/gravar o diretorio de certificados (permissao negada). */
export const CERTIFICATE_STORAGE_ACCESS_USER_MESSAGE =
  'Você não pode acessar o sistema da maquina atual, verifique se voce tem permissão de acesso ou fale com administrador!';

/**
 * Corpo de erro do ASP.NET (Developer Exception Page ou texto bruto) costuma incluir
 * UnauthorizedAccessException / IOException ao acessar paths como /usr/share/Microled.
 */
export function mapCertificateStorageErrorToUserMessage(apiMessage: string): string | null {
  const s = apiMessage.toLowerCase();
  const unauthorizedPath =
    s.includes('unauthorizedaccessexception') ||
    (s.includes('access to the path') && (s.includes('denied') || s.includes('is denied')));
  const ioNotPermitted =
    s.includes('ioexception') && s.includes('operation not permitted');

  if (unauthorizedPath || ioNotPermitted) {
    return CERTIFICATE_STORAGE_ACCESS_USER_MESSAGE;
  }

  return null;
}
