// sesiones-agendadas.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Session {
  id: number;
  advisorName: string;
  subject: string;
  date: string;
  time: string;
  modality: 'En línea' | 'Presencial';
  isPast: boolean;
}

@Component({
  selector: 'app-sesiones-agendadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones-agendadas.html',
  styleUrls: ['./sesiones-agendadas.css']
})
export class SesionesAgendadasComponent {
  sessions: Session[] = [
    {
      id: 1,
      advisorName: 'Ana López',
      subject: 'Cálculo diferencial',
      date: '2025-11-25',
      time: '10:00',
      modality: 'En línea',
      isPast: false
    },
    {
      id: 2,
      advisorName: 'Carlos Ramírez',
      subject: 'Programación orientada a objetos',
      date: '2025-11-25',
      time: '16:30',
      modality: 'Presencial',
      isPast: false
    },
    {
      id: 3,
      advisorName: 'María Gómez',
      subject: 'Inglés B2',
      date: '2025-11-15',
      time: '09:00',
      modality: 'En línea',
      isPast: true
    }
  ];

  selectedSession: Session | null = null;
  reviewComment = '';

  get upcomingSessions(): Session[] {
    return this.sessions.filter(s => !s.isPast);
  }

  get pastSessions(): Session[] {
    return this.sessions.filter(s => s.isPast);
  }

  startReview(session: Session): void {
    this.selectedSession = session;
    this.reviewComment = '';
  }

  submitReview(): void {
    if (!this.selectedSession) return;

    console.log('Reseña enviada:', {
      sessionId: this.selectedSession.id,
      comment: this.reviewComment
    });

    this.selectedSession = null;
    this.reviewComment = '';
  }
}
