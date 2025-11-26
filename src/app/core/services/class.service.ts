import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';

/**
 * DTO basado en lo que razonablemente debería devolver toStudentResponse().
 */
export interface StudentClassResponse {
  id: number;              // id de la clase
  title: string;           // título de la clase
  description?: string | null;
  classDate: string;       // "YYYY-MM-DD" (viene de LocalDate)
  tutorName: string;       // o "teacherName" / "adviserName" / como esté en tu mapper
  specialtyName?: string | null; // opcional: nombre de la materia/área
  modality?: string | null;      // si más adelante agregan modalidad
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  /**
   * Clases en las que el usuario autenticado es ALUMNO.
   * GET /api/v1/classes/enrolled/mine
   */
  getMyEnrolledClasses(): Observable<StudentClassResponse[]> {
    const url = `${this.baseUrl}${environment.endpoints.classes.enrolledMine}`;
    return this.http.get<StudentClassResponse[]>(url);
  }
}
