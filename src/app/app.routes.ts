import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing.page').then((m) => m.LandingPage),
  },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup').then((m) => m.Signup) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },

  // --- TUS RUTAS DE HOME (SE QUEDAN INTACTAS) ---
  {
    path: 'dashboard-asesor',
    loadComponent: () =>
      import('./pages/dashboard-asesor/dashboard-asesor').then((m) => m.DashboardAsesor),
  },
  {
    path: 'student-home',
    loadComponent: () => import('./pages/student-home/student-home').then((m) => m.StudentHome),
  },
  {
    path: 'complete-profile',
    loadComponent: () => import('./pages/complete-profile/complete-profile').then((m) => m. CompleteProfile),
  },

  // --- NUEVAS RUTAS DE CHAT (AÑADIDAS) ---
  {
    path: 'chat-tutor', // Esta es la nueva URL
    loadComponent: () => import('./pages/dashboard-asesor/dashboard-asesor').then(m => m.DashboardAsesor), // REUTILIZA el layout
    children: [
      {
        path: '', // Carga el chat DENTRO del layout
        loadComponent: () => import('./pages/chat/chat').then(m => m.ChatComponent)
      }
    ]
  },
  {
    path: 'chat-alumno', // Esta es la nueva URL
    loadComponent: () => import('./pages/student-home/student-home').then(m => m.StudentHome), // REUTILIZA el layout
    children: [
      {
        path: '', // Carga el chat DENTRO del layout
        loadComponent: () => import('./pages/chat/chat').then(m => m.ChatComponent)
      }
    ]
  }

  // --- (La ruta 'chat' individual se elimina si ya no la necesitas) ---
  // {
  //   path: 'chat',
  //   loadComponent: () => import('./pages/chat/chat').then((m) => m.ChatComponent)
  // }
];