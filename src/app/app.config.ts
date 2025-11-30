import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

import {routes} from './app.routes';
import {authInterceptor} from './core/interceptors/auth.interceptor';

import {
  LucideAngularModule,
  Menu,
  Inbox,
  GraduationCap,
  MessagesSquare,
  Star,
  LogOut,
  PanelRightOpen,
  PanelLeftOpen,
  Calendar,
  Users,
  Pencil,
  Trash2,
  Plus,
  X,
  Home,
  Bell,
  Search,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu,
        Inbox,
        GraduationCap,
        MessagesSquare,
        Star,
        LogOut,
        PanelRightOpen,
        PanelLeftOpen,
        Calendar,
        Users,
        Pencil,
        Trash2,
        Plus,
        X,
        Home,
        Bell,
        Search,
      })
    ),
  ],
};
