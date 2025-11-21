import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para el perfil del usuario
 */
export interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  roleId?: number;
  // Agrega aquí los campos que necesites según tu modelo de backend
}

@Injectable({
  providedIn: 'root'
})
export class Profile {
  private apiUrl = `${environment.apiUrl}/api/profile`;  // Ajusta la ruta según tu backend

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el perfil de un usuario por ID
   * @param id ID del usuario
   * @returns Observable con los datos del perfil
   */
  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene el perfil del usuario autenticado actual
   * @returns Observable con los datos del perfil
   */
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  /**
   * Actualiza el perfil del usuario
   * @param data Datos del perfil a actualizar
   * @returns Observable con el perfil actualizado
   */
  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, data);
  }

  /**
   * Actualiza el perfil de un usuario específico (por ID)
   * @param id ID del usuario
   * @param data Datos del perfil a actualizar
   * @returns Observable con el perfil actualizado
   */
  updateProfileById(id: number, data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Sube una imagen de avatar
   * @param file Archivo de imagen
   * @returns Observable con la URL del avatar subido
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData);
  }
}
