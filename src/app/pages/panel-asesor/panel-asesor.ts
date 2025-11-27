// panel-asesor.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Estado de la solicitud recibida */
type RequestStatus = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

interface ReceivedRequest {
  id: number;
  studentName: string;
  subject: string;
  requestDate: string;
  message: string;
  status: RequestStatus;
}

interface AdvisorSession {
  id: number;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  modality: 'En línea' | 'Presencial';
}

interface AdvisorProfile {
  name: string;
  subjects: string[];
  availability: string;
}

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-asesor.html',
  styleUrls: ['./panel-asesor.css']
})
export class PanelAsesorComponent {
  /* Solicitudes recibidas (datos mock) */
  receivedRequests: ReceivedRequest[] = [
    {
      id: 1,
      studentName: 'Juan Pérez',
      subject: 'Cálculo diferencial',
      requestDate: '2025-11-22',
      message: 'Me gustaría repasar límites y derivadas antes del examen.',
      status: 'PENDIENTE'
    },
    {
      id: 2,
      studentName: 'María López',
      subject: 'Programación orientada a objetos',
      requestDate: '2025-11-21',
      message: 'Tengo dudas sobre herencia y polimorfismo en Java.',
      status: 'ACEPTADA'
    },
    {
      id: 3,
      studentName: 'Carlos Sánchez',
      subject: 'Inglés B2',
      requestDate: '2025-11-20',
      message: 'Quiero practicar comprensión lectora para un examen de certificación.',
      status: 'RECHAZADA'
    }
  ];

  /* Próximas sesiones (datos mock) */
  upcomingSessions: AdvisorSession[] = [
    {
      id: 1,
      studentName: 'María López',
      subject: 'Programación orientada a objetos',
      date: '2025-11-24',
      time: '16:00',
      modality: 'En línea'
    },
    {
      id: 2,
      studentName: 'Juan Pérez',
      subject: 'Cálculo diferencial',
      date: '2025-11-25',
      time: '10:30',
      modality: 'Presencial'
    }
  ];

  /* Perfil del asesor (datos mock) */
  advisorProfile: AdvisorProfile = {
    name: 'Ana Rodríguez',
    subjects: ['Cálculo diferencial', 'Álgebra lineal'],
    availability: 'Lunes a jueves de 16:00 a 20:00, viernes de 15:00 a 18:00.'
  };

  /* Campo auxiliar para edición de materias como texto */
  subjectsInput: string = this.advisorProfile.subjects.join(', ');

  /* Indicador de guardado local */
  profileSaved = false;

  /* Acciones sobre solicitudes */

  acceptRequest(request: ReceivedRequest): void {
    if (request.status === 'ACEPTADA') {
      return;
    }
    request.status = 'ACEPTADA';
  }

  rejectRequest(request: ReceivedRequest): void {
    if (request.status === 'RECHAZADA') {
      return;
    }
    request.status = 'RECHAZADA';
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ACEPTADA':
        return 'Aceptada';
      case 'RECHAZADA':
        return 'Rechazada';
      default:
        return status;
    }
  }

  /* Guardado de perfil (local) */

  saveProfile(): void {
    const normalized = this.subjectsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.advisorProfile.subjects = normalized;
    this.profileSaved = true;

    console.log('Perfil de asesor guardado localmente:', this.advisorProfile);
  }
}

