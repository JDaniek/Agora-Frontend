import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '@env/environment';

export interface NotificationDto {
  notificationId: number;
  status: string;                 // pending / accepted / declined / read / unread / archived
  createdAt: string;              // ISO
  notificationTypeName: string;   // contact_request / class_enrollment_approved / ...
  senderFirstName?: string | null;
  senderLastName?: string | null;
  senderPhotoUrl?: string | null;
  classDate?: string | null;
  classTitle?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.notifications.mine}`;

  constructor(private http: HttpClient) {
  }

  getMyNotifications(status?: string): Observable<NotificationDto[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<NotificationDto[]>(this.baseUrl, {params}).pipe(
      catchError(err => {
        console.error('Error al obtener notificaciones', err);
        return throwError(() => err);
      })
    );
  }

  acceptRequest(notificationId: number): Observable<{ chatId: number }> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.update.replace(':id', String(notificationId))}`;
    return this.http.patch<{ chatId: number }>(url, {status: 'accepted'});
  }

  declineRequest(notificationId: number): Observable<{ message: string }> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.update.replace(':id', String(notificationId))}`;
    return this.http.patch<{ message: string }>(url, {status: 'declined'});
  }

  markAsRead(notificationId: number): Observable<{ message: string }> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.update.replace(':id', String(notificationId))}`;
    return this.http.patch<{ message: string }>(url, {status: 'read'});
  }
}
