import { InjectionToken } from '@angular/core';

export const NFSE_API_BASE_URL = new InjectionToken<string>('NFSE_API_BASE_URL', {
  factory: () => '/api/nfse',
});

export const CERTIFICATES_API_URL = new InjectionToken<string>('CERTIFICATES_API_URL', {
  factory: () => 'http://localhost:5278/api/local/certificates',
});

export const CERTIFICATES_SELECT_API_URL = new InjectionToken<string>('CERTIFICATES_SELECT_API_URL', {
  factory: () => 'http://localhost:5278/api/local/certificates/select',
});

export const LOCAL_NFE_CONSULT_API_URL = new InjectionToken<string>('LOCAL_NFE_CONSULT_API_URL', {
  factory: () => 'http://localhost:5278/api/local/nfe/consult',
});

export const LOCAL_NFE_CANCEL_API_URL = new InjectionToken<string>('LOCAL_NFE_CANCEL_API_URL', {
  factory: () => 'http://localhost:5278/api/local/nfe/cancel',
});

export const LOCAL_RPS_GENERATE_FILES_API_URL = new InjectionToken<string>(
  'LOCAL_RPS_GENERATE_FILES_API_URL',
  {
    factory: () => 'http://localhost:5278/api/local/rps/generate-files',
  },
);

export const LOCAL_RPS_PROCESS_API_URL = new InjectionToken<string>('LOCAL_RPS_PROCESS_API_URL', {
  factory: () => 'http://localhost:5278/api/local/rps/process',
});

export const LOCAL_RPS_STATUS_API_URL = new InjectionToken<string>('LOCAL_RPS_STATUS_API_URL', {
  factory: () => 'http://localhost:5278/api/local/rps/status',
});
