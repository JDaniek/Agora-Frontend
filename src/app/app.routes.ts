import { Routes } from '@angular/router';

export const routes: Routes = [
  // Página principal (Landing Page)
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing.page').then((m) => m.LandingPage),
  },

  // Registro / Login
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

  // Completar perfil (vista de llenar perfil)
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        (m) => m.CompleteProfile
      ),
  },

  // 🆕 Nueva vista: Home del Alumno
  {
    path: 'student-home',
    loadComponent: () =>
      import('./pages/student-home/student-home').then(
        (m) => m.StudentHome
      ),
  },

  // Ruta por defecto o fallback (opcional)
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
