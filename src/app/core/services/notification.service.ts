// src/app/core/services/notification.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

// Estados que tu backend soporta como query param (?status=...)
export type NotificationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'read'
  | 'unread'
  | 'archived';

/**
 * DTO que representa UNA notificación tal como la regresa el backend.
 * IMPORTANTE: Ajusta los nombres de campos cuando veas el JSON real
 * que devuelve GET /notifications.
 */
export interface NotificationDto {
  notificationId: number;
  status: string;  // 'pending' | 'accepted' | 'read' | ...
  createdAt: string;  // ISO string

  notificationTypeName:
    | 'contact_request'
    | 'new_chat_message'
    | 'class_enrollment_request'
    | 'class_enrollment_approved'
    | 'class_enrollment_declined';

  senderFirstName?: string | null;
  senderLastName?: string | null;
  senderAvatarUrl?: string | null;

  classDate?: string | null; // 'YYYY-MM-DD'
  classTime?: string | null; // 'HH:mm - HH:mm' o similar

  message?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  /**
   * GET /api/v1/notifications[?status=...]
   */
  getMyNotifications(status?: NotificationStatus): Observable<NotificationDto[]> {
    const url = `${this.baseUrl}${environment.endpoints.notifications.mine}`;

    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<NotificationDto[]>(url, {params}).pipe(
      catchError(err => {
        console.error('Error al obtener notificaciones', err);
        return of<NotificationDto[]>([]);
      })
    );
  }

  /**
   * PATCH /api/v1/notifications/{id}
   * Tu backend espera un body UpdateNotificationStatusRequest:
   *   { status: "accepted" | "declined" | "read" }
   *
   * Y responde:
   *   - accepted -> 201 con { chatId: number }
   *   - declined/read -> 200 con { message: string }
   */
  updateNotificationStatus(
    id: number,
    status: 'accepted' | 'declined' | 'read'
  ): Observable<{ chatId?: number; message?: string }> {
    const path = environment.endpoints.notifications.update.replace(':id', String(id));
    const url = `${this.baseUrl}${path}`;

    return this.http.patch<{ chatId?: number; message?: string }>(url, {status}).pipe(
      catchError(err => {
        console.error(`Error al actualizar notificación ${id}`, err);
        return of({});
      })
    );
  }

  // Azúcar sintáctica
  acceptRequest(id: number) {
    return this.updateNotificationStatus(id, 'accepted');
  }

  declineRequest(id: number) {
    return this.updateNotificationStatus(id, 'declined');
  }

  markAsRead(id: number) {
    return this.updateNotificationStatus(id, 'read');
  }
}
