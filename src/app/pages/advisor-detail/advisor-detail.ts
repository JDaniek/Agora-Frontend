// advisor-detail.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Modelo principal del asesor */
interface Advisor {
  id: number;
  name: string;
  photoUrl: string | null;
  subjects: string[];
  levels: string[];
  modalities: string[];
  location: string | null;
  description: string | null;
}

/* Modelo para la solicitud de asesoría */
interface AdvisorRequest {
  subject: string;
  modality: string;
  message: string;
}

@Component({
  selector: 'app-advisor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advisor-detail.html',
  styleUrls: ['./advisor-detail.scss']
})
export class AdvisorDetailComponent {
  /* Datos mock del asesor. Más adelante se pueden cargar desde el router o un servicio */
  advisor: Advisor = {
    id: 1,
    name: 'Ana López',
    photoUrl: null,
    subjects: ['Cálculo diferencial', 'Álgebra lineal'],
    levels: ['Bachillerato', 'Universidad'],
    modalities: ['En línea', 'Presencial'],
    location: 'Tuxtla Gutiérrez, Chiapas',
    description:
      'Asesora en áreas de matemáticas para estudiantes de bachillerato y primeros semestres de universidad. Enfocada en reforzar fundamentos y resolución de ejercicios.'
  };

  /* Estado del formulario de solicitud */
  showRequestForm = false;
  requestSent = false;

  /* Modelo de la solicitud actual */
  request: AdvisorRequest = {
    subject: '',
    modality: '',
    message: ''
  };

  /** Iniciales del asesor para el avatar cuando no hay foto */
  get advisorInitials(): string {
    if (!this.advisor.name) {
      return '';
    }
    const parts = this.advisor.name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  /** Muestra el formulario de solicitud */
  showRequestFormPanel(): void {
    this.showRequestForm = true;
    this.requestSent = false;
  }

  /** Envía la solicitud de forma local (sin backend) */
  submitRequest(): void {
    if (!this.request.subject || !this.request.modality) {
      return;
    }

    const payload: AdvisorRequest = {
      subject: this.request.subject,
      modality: this.request.modality,
      message: this.request.message
    };

    // Aquí en el futuro se podría llamar a un servicio HTTP para enviar la solicitud.
    console.log('Solicitud de asesoría enviada (mock):', payload);

    this.requestSent = true;
    this.showRequestForm = false;
  }

  /** Limpia el formulario y permite preparar una nueva solicitud */
  resetForm(): void {
    this.request = {
      subject: '',
      modality: '',
      message: ''
    };
    this.requestSent = false;
    this.showRequestForm = false;
  }
}
