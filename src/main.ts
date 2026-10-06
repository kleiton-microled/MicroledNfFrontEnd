import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {
  MICROLED_RUNTIME_CONFIG,
  loadMicroledRuntimeConfig,
} from './app/core/microled-runtime-config';

loadMicroledRuntimeConfig()
  .then((runtimeConfig) =>
    bootstrapApplication(App, {
      ...appConfig,
      providers: [
        ...appConfig.providers,
        { provide: MICROLED_RUNTIME_CONFIG, useValue: runtimeConfig },
      ],
    }),
  )
  .catch((err) => console.error(err));
