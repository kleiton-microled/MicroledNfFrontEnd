import { InjectionToken } from '@angular/core';

export interface MicroledRuntimeConfig {
  notasFiscaisApiUrl: string;
  localAgentBaseUrl: string;
}

export const DEFAULT_MICROLED_RUNTIME_CONFIG: MicroledRuntimeConfig = {
  notasFiscaisApiUrl: 'https://amktechsistemas.com.br/api/v1/notas-fiscais',
  localAgentBaseUrl: 'http://localhost:5278',
};

export const MICROLED_RUNTIME_CONFIG = new InjectionToken<MicroledRuntimeConfig>(
  'MICROLED_RUNTIME_CONFIG',
  { factory: () => DEFAULT_MICROLED_RUNTIME_CONFIG },
);

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

export function normalizeRuntimeConfig(
  raw: Partial<MicroledRuntimeConfig> | null | undefined,
): MicroledRuntimeConfig {
  return {
    notasFiscaisApiUrl: trimSlash(
      raw?.notasFiscaisApiUrl || DEFAULT_MICROLED_RUNTIME_CONFIG.notasFiscaisApiUrl,
    ),
    localAgentBaseUrl: trimSlash(
      raw && Object.prototype.hasOwnProperty.call(raw, 'localAgentBaseUrl')
        ? (raw.localAgentBaseUrl ?? '')
        : DEFAULT_MICROLED_RUNTIME_CONFIG.localAgentBaseUrl,
    ),
  };
}

export async function loadMicroledRuntimeConfig(): Promise<MicroledRuntimeConfig> {
  try {
    const response = await fetch('runtime-config.json', { cache: 'no-store' });
    if (!response.ok) {
      return DEFAULT_MICROLED_RUNTIME_CONFIG;
    }

    const json = (await response.json()) as Partial<MicroledRuntimeConfig>;
    return normalizeRuntimeConfig(json);
  } catch {
    return DEFAULT_MICROLED_RUNTIME_CONFIG;
  }
}
