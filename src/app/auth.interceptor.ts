import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor funcional (moderno) que añade el token JWT a las peticiones.
 */
export const AuthInterceptor: HttpInterceptorFn =
  (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {

    // 1. Obtiene el token de localStorage
    const token = localStorage.getItem('token');

    // 2. Si no hay token, deja pasar la petición
    if (!token) {
      return next(req);
    }

    // 3. Si hay token, clona la petición y añade la cabecera
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    // 4. Envía la petición clonada (con el token)
    return next(cloned);
  };
