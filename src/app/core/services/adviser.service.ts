import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, map, of} from 'rxjs';

// --- INTERFACES ---

// Modelo para búsqueda (Vista Estudiante)
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

// Modelo para solicitudes (Vista Asesor)
export interface NotificationRequest {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  status: 'pending' | 'accepted' | 'declined' | 'read' | 'unread';
  createdAt: string;
  sender?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    level?: string;
  };
}

// Modelo para clases
export interface ClassResponse {
  id: number;
  title: string;
  description: string;
  classDate: string;      // "2025-11-28"
  capacityPerSlot: number;
  specialtyId: number;
  reservedSlots?: number; // Si el backend te dice cuántos alumnos van
  isActive?: boolean;
}

// Datos para las especialidades
export interface Specialty {
  id: number;
  name: string;
}

// --- RESEÑAS ---
export interface ReviewResponse {
  reviewId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentPhoto?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdviserService {
  // URL base general
  private readonly apiUrl = environment.apiUrl;

  // Endpoint específico para búsqueda (legacy code)
  private readonly searchUrl = `${environment.apiUrl}${environment.endpoints.advisers.list}`;

  constructor(private http: HttpClient) {
  }

  // ==========================================
  //  1. FUNCIONALIDAD ESTUDIANTE (Buscar Asesores)
  // ==========================================

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

    return this.http.get<AdviserCardResponse[]>(this.searchUrl, {params});
  }

  /**
   * Obtener clases de un profesor específico (público)
   */
  getAdviserClasses(tutorId: number): Observable<ClassResponse[]> {
    return this.http.get<ClassResponse[]>(`${this.apiUrl}/classes/teachers/${tutorId}`);
  }

  /**
   * Solicitar contacto alumno → asesor
   */
  contactAdviser(tutorId: number): Observable<any> {
    const url = `${this.apiUrl}/advisers/${tutorId}/contact`;
    return this.http.post(url, {});
  }

  // ==========================================
  //  2. FUNCIONALIDAD ASESOR (Panel de Control)
  // ==========================================

  getNotifications(): Observable<NotificationRequest[]> {
    const url = `${this.apiUrl}${environment.endpoints.notifications.mine}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('0. Respuesta RAW del Backend:', response);

        let items: any[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response && typeof response === 'object') {
          items = [response];
        }

        return items.map((item: any) => ({
          id: item.notificationId,
          userId: 0,
          title: item.notificationTypeName === 'contact_request'
            ? 'Solicitud de Contacto'
            : 'Notificación',
          message: 'Hola, me gustaría contactar contigo.',
          type: item.notificationTypeName,
          status: item.status,
          createdAt: item.createdAt,
          sender: {
            id: 0,
            fullName: `${item.senderFirstName || 'Usuario'} ${item.senderLastName || ''}`.trim(),
            avatarUrl: item.senderPhotoUrl,
            level: 'Estudiante'
          }
        }));
      })
    );
  }

  /**
   * Responde a una solicitud (Aceptar/Rechazar/Leer).
   * PATCH /api/v1/notifications/{id}
   * Body: { "status": "accepted" }
   */
  respondToRequest(
    notificationId: number,
    status: 'accepted' | 'declined' | 'read'
  ): Observable<any> {
    const url = `${this.apiUrl}/notifications/${notificationId}`;
    const body = {status};
    console.log(`📡 Enviando PATCH a: ${url}`, body);
    return this.http.patch(url, body);
  }

  /**
   * Obtiene las clases creadas por el asesor autenticado.
   * GET /api/v1/classes/mine
   */
  getMyClasses(): Observable<any[]> {
    const url = `${this.apiUrl}${environment.endpoints.classes.mine}`;
    return this.http.get<any[]>(url);
  }

  // ==========================================
  //  2.b RESEÑAS DE PROFESOR
  // ==========================================

  /**
   * 1. Vista Pública (Cuando un alumno ve al profe)
   * Obtener lista de reseñas de un profesor
   * GET /api/v1/reviews/teachers/{teacherId}
   */
  getTeacherReviews(teacherId: number): Observable<ReviewResponse[]> {
    const url = `${this.apiUrl}/reviews/teachers/${teacherId}`;
    return this.http.get<any[]>(url).pipe(
      map(data =>
        data.map(r => ({
          reviewId: r.id || r.reviewId,

          // El backend manda 'studentFullName', lo asignamos a nuestra propiedad 'studentName'
          studentName: r.studentFullName || r.studentName || 'Anónimo',

          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          studentPhoto: r.studentPhotoUrl
        }) as ReviewResponse)
      )
    );
  }

  /**
   * Obtener resumen (promedio)
   * GET /api/v1/reviews/teachers/{teacherId}/summary
   */
  getTeacherSummary(teacherId: number): Observable<ReviewSummary> {
    const url = `${this.apiUrl}/reviews/teachers/${teacherId}/summary`;
    return this.http.get<ReviewSummary>(url);
  }

  /**
   * Crear reseña (Alumno -> Profesor)
   * POST /api/v1/reviews/teachers/{teacherId}
   */
  createTeacherReview(teacherId: number, rating: number, comment: string): Observable<any> {
    const url = `${this.apiUrl}/reviews/teachers/${teacherId}`;
    return this.http.post(url, {rating, comment});
  }

  // ==========================================
  //  2.c CLASES → ALUMNOS (Inscripciones y reseñas a alumnos)
  // ==========================================

  /**
   * Obtener alumnos inscritos en una clase
   * GET /api/v1/classes/{classId}/enrollments
   */
  getClassEnrollments(classId: number): Observable<any[]> {
    const url = `${this.apiUrl}/classes/${classId}/enrollments`;
    return this.http.get<any[]>(url);
  }

  /**
   * Calificar a un alumno
   * POST /api/v1/reviews/students/{studentId}
   */
  createStudentReview(studentId: number, rating: number, comment: string): Observable<any> {
    const url = `${this.apiUrl}/reviews/students/${studentId}`;
    return this.http.post(url, {rating, comment});
  }

  // ==========================================
  //  3. UTILIDADES COMPARTIDAS
  // ==========================================

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // --- GESTIÓN DE CLASES (NUEVOS) ---

  /**
   * Crear nueva clase
   * POST /api/v1/classes
   */
  createClass(data: any): Observable<any> {
    const url = `${this.apiUrl}${environment.endpoints.classes.root}`;
    return this.http.post(url, data);
  }

  /**
   * Eliminar clase
   * DELETE /api/v1/classes/{id}
   */
  deleteClass(classId: number): Observable<void> {
    const url = `${this.apiUrl}${environment.endpoints.classes.byId.replace(':id', classId.toString())}`;
    return this.http.delete<void>(url);
  }

  /**
   * Actualizar clase
   * PATCH /api/v1/classes/{id}
   */
  updateClass(classId: number, data: Partial<ClassResponse>): Observable<ClassResponse> {
    const url = `${this.apiUrl}${environment.endpoints.classes.byId.replace(':id', classId.toString())}`;
    return this.http.patch<ClassResponse>(url, data);
  }

  /**
   * Obtener lista de especialidades (Catálogo)
   */
  getSpecialties(): Observable<Specialty[]> {
    const dbSpecialties = [
      {id: 1, name: 'Ciencias exactas'},
      {id: 2, name: 'Ciencias Naturales'},
      {id: 3, name: 'Ciencias Sociales'},
      {id: 4, name: 'Idiomas'},
      {id: 5, name: 'Artes'},
      {id: 6, name: 'Humanidades'},
      {id: 7, name: 'Comunicación'},
      {id: 8, name: 'Artes y Creatividad'},
      {id: 9, name: 'Negocios'},
      {id: 10, name: 'Economía'},
      {id: 11, name: 'Soft Skills'},
      {id: 12, name: 'Salud'},
      {id: 13, name: 'Bienestar'}
    ];
    return of(dbSpecialties);
  }

  /**
   * 2. Vista Privada (Cuando el asesor ve SUS reseñas)
   * Obtener mis reseñas (Como Asesor)
   * GET /api/v1/reviews/mine
   */
  getMyReviews(): Observable<ReviewResponse[]> {
    const url = `${this.apiUrl}/reviews/mine`;
    return this.http.get<any[]>(url).pipe(
      map(data =>
        data.map(r => ({
          reviewId: r.id || r.reviewId,

          // El backend manda 'studentFullName', lo asignamos a nuestra propiedad 'studentName'
          studentName: r.studentFullName || r.studentName || 'Anónimo',

          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          studentPhoto: r.studentPhotoUrl
        }))
      )
    );
  }

  /**
   * Obtener mis reseñas como ALUMNO (Lo que los profes dicen de mí)
   * GET /api/v1/reviews/students/mine
   */
  getMyStudentReviews(): Observable<ReviewResponse[]> {
    const url = `${this.apiUrl}/reviews/students/mine`;
    return this.http.get<any[]>(url).pipe(
      map(data =>
        data.map(r => ({
          reviewId: r.id || r.reviewId,
          // IMPORTANTE: El backend seguramente manda "teacherName" o "authorName".
          // Lo mapeamos a 'studentName' para reutilizar la interfaz y el HTML sin crear DTOs nuevos.
          studentName: r.teacherFullName || r.teacherName || r.reviewerName || 'Profesor',
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          studentPhoto: r.teacherPhotoUrl || r.reviewerPhotoUrl // Foto del profe
        }) as ReviewResponse)
      )
    );
  }
}
