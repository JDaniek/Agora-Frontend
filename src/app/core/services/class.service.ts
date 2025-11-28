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

// Respuesta de una clase creada por el tutor (tiene más datos)
export interface ClassResponse {
  id: number;
  title: string;
  description: string | null;
  classDate: string;
  capacityPerSlot: number;
  specialtyId: number;
  isActive: boolean;
}

// Payload para crear una clase
export interface CreateClassRequest {
  title: string;
  description?: string;
  classDate: string;
  capacityPerSlot: number;
  specialtyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.classes.enrolledMine}`;

  constructor(private http: HttpClient) {
  }

  getMyEnrolledClasses(): Observable<StudentClassResponse[]> {
    return this.http.get<StudentClassResponse[]>(this.baseUrl);
  }

  /**
   * Obtiene las clases creadas por el asesor logueado.
   * GET /api/v1/classes/mine
   */
  getMyClassesTutor(): Observable<ClassResponse[]> {
    const url = `${this.apiUrl}${environment.endpoints.classes.mine}`;
    return this.http.get<ClassResponse[]>(url);
  }

  /**
   * Crea una nueva clase.
   * POST /api/v1/classes
   */
  createClass(data: CreateClassRequest): Observable<ClassResponse> {
    const url = `${this.apiUrl}${environment.endpoints.classes.root}`;
    return this.http.post<ClassResponse>(url, data);
  }

  /**
   * Inscribe un alumno en una clase específica.
   * POST /api/v1/classes/{id}/enrollments
   */
  enrollStudent(classId: number, studentId: number): Observable<any> {
    // Aquí hacemos el reemplazo manual ya que environment usa strings estáticos
    // '/classes/:id/enrollments' -> '/classes/15/enrollments'
    const path = environment.endpoints.classes.enrollmentsByClass.replace(':id', classId.toString());
    const url = `${this.apiUrl}${path}`;
    
    // El backend espera un body con el studentId (según tu EnrollStudentRequest)
    return this.http.post(url, { studentId });
  }
}
