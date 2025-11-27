// src/app/core/services/auth.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';

/** Request de login: lo que espera LoginRequest en el backend */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Request de registro: lo que espera RegisterRequest en el backend */
export interface RegisterRequest {
  firstName: string;
  secondName: string | null;
  lastName: string;
  roleId: number;
  email: string;
  password: string;
}

/** Usuario autenticado según lo que devuelve Pair(user, token).toAuthResponse() */
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  roleId: number;
}

/** Respuesta de login/registro */
export interface AuthResponse extends AuthUser {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}${environment.endpoints.auth.login}`;
  private readonly registerUrl = `${environment.apiUrl}${environment.endpoints.auth.register}`;

  constructor(private http: HttpClient) {
  }

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(this.loginUrl, payload);
  }

  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(this.registerUrl, payload);
  }
}
