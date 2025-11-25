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
  styleUrls: ['./advisor-detail.css']
})
export class AdvisorDetailComponent {
  /* Datos mock del asesor */
  advisor: Advisor = {
    id: 1,
    name: 'Ana López',
    photoUrl: null,
    subjects: ['Cálculo diferencial', 'Álgebra lineal'],
    levels: ['Bachillerato', 'Universidad'],
    modalities: ['En línea', 'Presencial'],
    location: 'Tuxtla Gutiérrez, Chiapas',
    description:
      'Docente con experiencia en matemáticas para nivel medio superior y superior. Enfocada en la resolución guiada de ejercicios y en la preparación para evaluaciones parciales y finales.'
  };

  /* Estado del formulario de solicitud */
  showRequestForm = false;
  isSubmitting = false;
  requestSent = false;

  /* Modelo de la solicitud */
  request: AdvisorRequest = {
    subject: '',
    modality: 'En línea',
    message: ''
  };

  /* Iniciales del asesor, para avatar sin foto */
  get advisorInitials(): string {
    if (!this.advisor?.name) {
      return '';
    }

    const parts = this.advisor.name.split(' ').filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  /* Mostrar panel de formulario */
  showRequestFormPanel(): void {
    this.showRequestForm = true;
    this.requestSent = false;
  }

  /* Simular envío de solicitud */
  submitRequest(): void {
    if (!this.request.subject || !this.request.modality) {
      return;
    }

    this.isSubmitting = true;

    // Simulación de envío local
    setTimeout(() => {
      this.isSubmitting = false;
      this.requestSent = true;
      // Aquí en el futuro se podría llamar a un servicio HTTP
    }, 600);
  }

  /* Limpiar formulario */
  resetForm(): void {
    this.request = {
      subject: '',
      modality: 'En línea',
      message: ''
    };
    this.requestSent = false;
  }
}
