import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing-page/landing.page').then(m => m.LandingPage) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup').then(m => m.Signup) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'complete-profile', loadComponent: () => import('./pages/complete-profile/complete-profile').then(m => m.CompleteProfile) },
  { path: '**', redirectTo: '' }
];
