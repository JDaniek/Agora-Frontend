import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Obtener el token del storage (como lo guardaste en el login)
  const token = localStorage.getItem('token');

  let authReq = req;

  // 2. Si existe token, clonar la petición y agregar el header
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Pasar la petición y manejar errores globales (ej: token expirado)
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token inválido o expirado -> Mandar al login y limpiar
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
