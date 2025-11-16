import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/landing-page/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard-asesor',
    loadComponent: () =>
      import('./pages/dashboard-asesor/dashboard-asesor').then(
        (m) => m.DashboardAsesor
      ),
  },
  {
    path: 'student-home',
    loadComponent: () =>
      import('./pages/student-home/student-home').then((m) => m.StudentHome),
  },
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        (m) => m.CompleteProfile // ← sin espacio
      ),
  },
  // (opcional) fallback
  { path: '**', redirectTo: '' },
];
