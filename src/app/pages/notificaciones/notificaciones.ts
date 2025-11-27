// notificaciones.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class NotificacionesComponent {

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Solicitud aceptada',
      description: 'Un asesor aprobó tu solicitud para una sesión.',
      date: '2025-11-22 10:15',
      isRead: false
    },
    {
      id: 2,
      title: 'Recordatorio de sesión',
      description: 'Tienes una sesión programada mañana a las 10:00.',
      date: '2025-11-21 08:30',
      isRead: false
    },
    {
      id: 3,
      title: 'Actualización del sistema',
      description: 'Se realizaron mejoras en la plataforma.',
      date: '2025-11-20 14:20',
      isRead: true
    }
  ];

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      notification.isRead = true;
    }
  }
}

