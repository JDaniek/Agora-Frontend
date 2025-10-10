import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing-page/landing.page').then(m => m.LandingPage) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup').then(m => m.Signup) },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) }
];
 