import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@env/environment';

export interface StudentClassResponse {
  classId: number;
  title: string;
  description: string | null;
  classDate: string;   // "YYYY-MM-DD"
  status: string;      // lo que devuelva el backend (ej. "active", "enrolled", etc.)
  tutorId: number;
  specialtyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.classes.enrolledMine}`;

  constructor(private http: HttpClient) {
  }

  getMyEnrolledClasses(): Observable<StudentClassResponse[]> {
    return this.http.get<StudentClassResponse[]>(this.baseUrl);
  }
}
