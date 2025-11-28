import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, map} from 'rxjs';

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

//Modelo para clases
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

// ==========================================
  //  2. FUNCIONALIDAD ASESOR (Panel de Control)
  // ==========================================

  getNotifications(): Observable<NotificationRequest[]> {
    const url = `${this.apiUrl}${environment.endpoints.notifications.mine}`;

    return this.http.get<any>(url).pipe( // Cambiamos <any[]> a <any> por seguridad
      map(response => {
        console.log('0. Respuesta RAW del Backend:', response); // <--- LOG AQUÍ

        // PROTECCIÓN: Si el backend devuelve un solo objeto en lugar de un array, lo convertimos
        let items = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response && typeof response === 'object') {
          // Si devuelve { notificationId: 36 ... } sin corchetes []
          items = [response];
        }

        return items.map((item: any) => ({
          id: item.notificationId,
          userId: 0,
          // Si item.notificationTypeName no viene, ponemos un fallback
          title: item.notificationTypeName === 'contact_request' ? 'Solicitud de Contacto' : 'Notificación',
          message: 'Hola, me gustaría contactar contigo.',
          type: item.notificationTypeName,
          status: item.status,
          createdAt: item.createdAt,
          sender: {
            id: 0,
            // Protección contra nulos
            fullName: `${item.senderFirstName || 'Usuario'} ${item.senderLastName || ''}`,
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
   */
  respondToRequest(notificationId: number, status: 'accepted' | 'declined' | 'read'): Observable<any> {
    const url = `${this.apiUrl}${environment.endpoints.notifications.update.replace(':id', notificationId.toString())}`;
    // Si tu environment no tiene el replace placeholder, usa: `${this.apiUrl}/notifications/${notificationId}`
    return this.http.patch(url, {status});
  }

  /**
   * Obtiene las clases creadas por el asesor.
   * GET /api/v1/classes/mine
   */
  getMyClasses(): Observable<any[]> {
    const url = `${this.apiUrl}${environment.endpoints.classes.mine}`;
    return this.http.get<any[]>(url);
  }

  // ==========================================
  //  3. UTILIDADES COMPARTIDAS
  // ==========================================

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // La redirección se maneja en el componente para evitar dependencia circular con Router aquí
  }

  // --- GESTIÓN DE CLASES (NUEVOS) ---
  /**
   * Crear nueva clase
   * POST /api/v1/classes
   */
  createClass(data: any): Observable<any> {
    const url = `${this.apiUrl}${environment.endpoints.classes.root}`; // Asegúrate que en environment.ts classes.root sea '/classes'
    // O hardcoded: `${this.apiUrl}/classes`
    return this.http.post(url, data);
  }

  /**
   * Eliminar clase
   * DELETE /api/v1/classes/{id}
   */
  deleteClass(classId: number): Observable<void> {
    const url = `${this.apiUrl}${environment.endpoints.classes.byId.replace(':id', classId.toString())}`;
    // Si tu environment no tiene el replace, usa: `${this.apiUrl}/classes/${classId}`
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


}
