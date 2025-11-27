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
