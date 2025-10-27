import { Routes } from '@angular/router';

export const routes: Routes = [
  // Landing
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing.page').then((m) => m.LandingPage),
  },

  // Auth
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

  // Perfil incompleto
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        (m) => m.CompleteProfile
      ),
  },

  // Home alumno
  {
    path: 'student-home',
    loadComponent: () =>
      import('./pages/student-home/student-home').then(
        (m) => m.StudentHome
      ),
  },

  // ✅ PERFIL DE TUTOR (archivo: pages/tutor-profile/tutor-profile.ts, clase: TutorProfile)
  {
    path: 'tutor/:id',
    loadComponent: () =>
      import('./pages/tutor-profile/tutor-profile').then(
        (m) => m.TutorProfile
      ),
  },

  // ✅ DETALLE DE CLASE (archivo: pages/class-detail/class-detail.ts, clase: ClassDetail)
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

