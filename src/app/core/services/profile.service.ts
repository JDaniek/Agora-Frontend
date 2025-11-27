import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// DTO de Respuesta (GET) - Coincide con tu Kotlin ProfileResponse
export interface ProfileResponse {
  userId: number;
  description: string | null;
  photoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  level: string | null;
  specialties: { id: number; name: string }[];
}

// DTO de Petición (PUT) - Coincide con tu Kotlin UpdateProfileRequest
export interface UpdateProfileRequest {
  description?: string;
  photoUrl?: string;
  city?: string;
  stateCode: string;       // Obligatorio en tu backend
  level: string;           // Obligatorio en tu backend
  specialtyIds: number[];  // Obligatorio (Lista de IDs)
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly url = `${environment.apiUrl}${environment.endpoints.profile.me}`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.url);
  }

  // Ahora recibe el DTO correcto para actualizar
  updateMyProfile(payload: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(this.url, payload);
  }
}