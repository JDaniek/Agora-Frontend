import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';

export interface AdviserCardResponse {
  userId: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  level: string | null;
  description: string | null;
  specialties: string[];
  stateCode?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdviserService {
  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.advisers.list}`;

  constructor(private http: HttpClient) {
  }

  getAdvisers(filters: {
    search?: string;
    lugar?: string;
    nivel?: string;
    materia?: string;
  } = {}): Observable<AdviserCardResponse[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    return this.http.get<AdviserCardResponse[]>(this.baseUrl, {params});
  }
}
