import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';

export interface ProfileResponse {
  userId: number;
  description: string | null;
  photoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  level: string | null;
  specialties: { id: number; name: string }[];
}

// Lo que envías en el PUT (Coincide con UpdateProfileRequest de Kotlin)
export interface UpdateProfileRequest {
  description?: string;
  photoUrl?: string;
  city?: string;
  stateCode: string;       // Obligatorio en tu backend
  level: string;           // Obligatorio en tu backend
  specialtyIds: number[];  // Obligatorio, lista de IDs
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly url = `${environment.apiUrl}${environment.endpoints.profile.me}`;

  constructor(private http: HttpClient) {
  }

  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.url);
  }

  updateMyProfile(payload: Partial<ProfileResponse>) {
    return this.http.put<ProfileResponse>(this.url, payload);
  }
}
