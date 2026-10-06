import { InjectionToken, inject } from '@angular/core';
import { MICROLED_RUNTIME_CONFIG } from '../../../../core/microled-runtime-config';

function localAgentUrl(path: string): string {
  const base = inject(MICROLED_RUNTIME_CONFIG).localAgentBaseUrl.trim();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}

export const NFSE_API_BASE_URL = new InjectionToken<string>('NFSE_API_BASE_URL', {
  factory: () => '/api/nfse',
});

export const NOTAS_FISCAIS_API_URL = new InjectionToken<string>('NOTAS_FISCAIS_API_URL', {
  factory: () => inject(MICROLED_RUNTIME_CONFIG).notasFiscaisApiUrl,
});

export const CERTIFICATES_API_URL = new InjectionToken<string>('CERTIFICATES_API_URL', {
  factory: () => localAgentUrl('/api/local/certificates'),
});

export const CERTIFICATES_SELECT_API_URL = new InjectionToken<string>('CERTIFICATES_SELECT_API_URL', {
  factory: () => localAgentUrl('/api/local/certificates/select'),
});

export const LOCAL_NFE_CONSULT_API_URL = new InjectionToken<string>('LOCAL_NFE_CONSULT_API_URL', {
  factory: () => localAgentUrl('/api/local/nfe/consult'),
});

export const LOCAL_NFE_CANCEL_API_URL = new InjectionToken<string>('LOCAL_NFE_CANCEL_API_URL', {
  factory: () => localAgentUrl('/api/local/nfe/cancel'),
});

export const LOCAL_RPS_GENERATE_FILES_API_URL = new InjectionToken<string>(
  'LOCAL_RPS_GENERATE_FILES_API_URL',
  {
    factory: () => localAgentUrl('/api/local/rps/generate-files'),
  },
);

export const LOCAL_RPS_PROCESS_API_URL = new InjectionToken<string>('LOCAL_RPS_PROCESS_API_URL', {
  factory: () => localAgentUrl('/api/local/rps/process'),
});

export const LOCAL_RPS_STATUS_API_URL = new InjectionToken<string>('LOCAL_RPS_STATUS_API_URL', {
  factory: () => localAgentUrl('/api/local/rps/status'),
});

export const LOCAL_ACCESS_PENDING_RPS_API_URL = new InjectionToken<string>(
  'LOCAL_ACCESS_PENDING_RPS_API_URL',
  {
    factory: () => localAgentUrl('/api/local/access/pending-rps'),
  },
);

export const LOCAL_NFSE_SP_CALCULATE_TAXES_API_URL = new InjectionToken<string>(
  'LOCAL_NFSE_SP_CALCULATE_TAXES_API_URL',
  {
    factory: () => localAgentUrl('/api/local/nfse-sp/calculate-taxes'),
  },
);
