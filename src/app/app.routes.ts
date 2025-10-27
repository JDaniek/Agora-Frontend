import { Routes } from '@angular/router';

export const routes: Routes = [
  // Página principal
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

  // Completar perfil
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        (m) => m.CompleteProfile
      ),
  },

  // Home del alumno
  {
    path: 'student-home',
    loadComponent: () =>
      import('./pages/student-home/student-home').then(
        (m) => m.StudentHome
      ),
  },

  // Perfil del tutor
  {
    path: 'tutor/:id',
    loadComponent: () =>
      import('./pages/tutor-profile/tutor-profile').then(
        (m) => m.TutorProfile
      ),
  },

  // Detalle de clase
  {
    path: 'class/:id',
    loadComponent: () =>
      import('./pages/class-detail/class-detail').then(
        (m) => m.ClassDetail
      ),
  },

  // Chat
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat').then((m) => m.Chat),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];

