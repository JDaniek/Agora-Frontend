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

  // 🔵 NUEVA RUTA ASESOR DETALLE
  {
    path: 'details-asesor/:id',
    loadComponent: () =>
      import('./pages/detail-asesor/detail-asesor')
        .then((m) => m.AsesorDetalleComponent),
  },

  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        (m) => m.CompleteProfile
      ),
  },

   /* ⭐ NUEVA RUTA */
  {
    path: 'mis-solicitudes',
    loadComponent: () =>
      import('./pages/mis-solicitudes/mis-solicitudes')
        .then(m => m.MisSolicitudesComponent),
  },

  {
  path: 'sesiones-agendadas',
  loadComponent: () =>
    import('./pages/sesiones-agendadas/sesiones-agendadas')
      .then(m => m.SesionesAgendadasComponent),
},

{
  path: 'perfil-alumno',
  loadComponent: () =>
    import('./pages/perfil-alumno/perfil-alumno').then(
      (m) => m.PerfilAlumnoComponent
    ),
},

{
  path: 'notificaciones',
  loadComponent: () =>
    import('./pages/notificaciones/notificaciones').then(
      (m) => m.NotificacionesComponent
    ),
},


  /* fallback */
  { path: '**', redirectTo: '' },
];

