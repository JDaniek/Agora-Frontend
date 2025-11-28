import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
// Nota: Quitamos HttpClientModule de aquí, no se necesita con provideHttpClient
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {routes} from './app.routes';

import {authInterceptor} from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      // CORRECCIÓN: Usar la variable con minúscula
      withInterceptors([authInterceptor])
    )
  ]
};
