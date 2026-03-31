import { InjectionToken } from '@angular/core';

export const NFSE_API_BASE_URL = new InjectionToken<string>('NFSE_API_BASE_URL', {
  factory: () => '/api/nfse',
});

export const CERTIFICATES_API_URL = new InjectionToken<string>('CERTIFICATES_API_URL', {
  factory: () => 'http://localhost:5278/api/local/certificates',
});
