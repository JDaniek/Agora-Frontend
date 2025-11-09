import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, HttpClientModule, withInterceptors} from '@angular/common/http';
import { routes } from './app.routes';
import {AuthInterceptor} from './auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};
