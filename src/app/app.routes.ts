import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/landing-page/landing.page').then(m => m.LandingPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup').then(m => m.Signup),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'dashboard-asesor',
    loadComponent: () =>
      import('./pages/dashboard-asesor/dashboard-asesor').then(
        m => m.DashboardAsesor
      ),
  },
  {
    path: 'student-home',
    loadComponent: () =>
      import('./pages/student-home/student-home').then(
        m => m.StudentHome
      ),
  },
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./pages/complete-profile/complete-profile').then(
        m => m.CompleteProfile
      ),
  },

  /* NUEVA RUTA: Panel del Asesor */
  {
    path: 'panel-asesor',
    loadComponent: () =>
      import('./pages/panel-asesor/panel-asesor').then(
        m => m.PanelAsesorComponent
      ),
  },

  /* NUEVA RUTA: Mis solicitudes */
  {
    path: 'mis-solicitudes',
    loadComponent: () =>
      import('./pages/mis-solicitudes/mis-solicitudes').then(
        m => m.MisSolicitudesComponent
      ),
  },

  /* NUEVA RUTA: Sesiones agendadas */
  {
    path: 'sesiones-agendadas',
    loadComponent: () =>
      import('./pages/sesiones-agendadas/sesiones-agendadas').then(
        m => m.SesionesAgendadasComponent
      ),
  },

  /* NUEVA RUTA: Perfil del alumno */
  {
    path: 'perfil-alumno',
    loadComponent: () =>
      import('./pages/perfil-alumno/perfil-alumno').then(
        m => m.PerfilAlumnoComponent
      ),
  },

  /* NUEVA RUTA: Notificaciones */
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./pages/notificaciones/notificaciones').then(
        m => m.NotificacionesComponent
      ),
  },

  /* NUEVA RUTA: Detalle de asesor */
  {
    path: 'detail-asesor/:id',
    loadComponent: () =>
      import('./pages/advisor-detail/advisor-detail').then(
        m => m.AdvisorDetailComponent
      ),
  },

  // fallback
  { path: '**', redirectTo: '' },
];

