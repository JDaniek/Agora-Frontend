import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

export enum NotificationType {
  REQUEST = 'request',
  REVIEW = 'review',
  CLASS = 'class'
}

export type NotificationStatusFilter =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'all';

export interface Notification {
  id: number;
  type: NotificationType;
  userPhoto: string | null;
  userName: string;
  timestamp: Date;
  classDate?: string;
  classTime?: string;
  status?: string;
}

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-modal.html',
  styleUrls: ['./notifications-modal.css']
})
export class NotificationsModal {
  @Input() notifications: Notification[] = [];
  @Input() isOpen = false;

  // ⬇Filtro actual (para las pestañas)
  @Input() currentFilter: NotificationStatusFilter = 'pending';
// Recibimos el estado de carga desde el padre
  @Input() isLoading = false;
  @Output() close = new EventEmitter<void>();
  @Output() acceptRequest = new EventEmitter<number>();
  @Output() rejectRequest = new EventEmitter<number>();

  //  Emitimos cuando el usuario cambia de pestaña
  @Output() filterChange = new EventEmitter<NotificationStatusFilter>();

  NotificationType = NotificationType;

  // ---- Métodos de UI ----

  closeModal(): void {
    this.close.emit();
  }

  // alias para el botón (click)="onClose()"
  onClose(): void {
    this.closeModal();
  }

  onAcceptRequest(notificationId: number): void {
    this.acceptRequest.emit(notificationId);
  }

  onRejectRequest(notificationId: number): void {
    this.rejectRequest.emit(notificationId);
  }

  onChangeFilter(filter: NotificationStatusFilter): void {
    if (this.currentFilter === filter) return;
    this.filterChange.emit(filter);
  }

  trackById(index: number, item: Notification): number {
    return item.id;
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  }
}
