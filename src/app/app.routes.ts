import {Routes} from '@angular/router';
import {LandingPage} from './pages/landing-page/landing.page';
import {Signup} from './pages/signup/signup';

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
        // El nombre debe coincidir con: export class PanelAsesor
        m => m.PanelAsesor
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


  // fallback
  {path: '**', component: Signup},
];

