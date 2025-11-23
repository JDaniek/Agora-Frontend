// asesor-detalle.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Advisor {
  id: number;
  name: string;
  photoUrl: string | null;
  subjects: string[];
  levels: string[];
  modalities: string[];
  location: string | null;
  description: string;
}

interface AdvisorRequest {
  subject: string;
  modality: string;
  message: string;
}

@Component({
  selector: 'app-asesor-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-asesor.html',
  styleUrls: ['./detail-asesor.scss'],
})
export class AsesorDetalleComponent {
  // Datos simulados del asesor (mock local)
  advisor: Advisor = {
    id: 1,
    name: 'María López',
    photoUrl: null,
    subjects: ['Cálculo diferencial', 'Álgebra lineal', 'Fundamentos de programación'],
    levels: ['Bachillerato', 'Universidad'],
    modalities: ['En línea', 'Presencial'],
    location: 'Tuxtla Gutiérrez, Chiapas',
    description:
      'Docente con experiencia en asesorías de matemáticas y programación para estudiantes de nivel medio superior y superior. En cada sesión se trabaja con ejemplos prácticos y material de apoyo.',
  };

  // Estado del formulario de solicitud
  requestFormVisible = false;
  requestSent = false;

  // Modelo de la solicitud
  request: AdvisorRequest = {
    subject: '',
    modality: '',
    message: '',
  };

  constructor(private router: Router) {}

  /**
   * Muestra el formulario de solicitud de asesoría.
   */
  showRequestForm(): void {
    this.requestFormVisible = true;
    this.requestSent = false;
  }

  /**
   * Simula el envío de la solicitud.
   * No realiza llamadas a ningún backend.
   */
  onSubmitRequest(): void {
    if (!this.request.subject || !this.request.modality) {
      return;
    }

    // Aquí solo se simula el envío. En un futuro se podría llamar a un servicio HTTP.
    this.requestSent = true;
    this.requestFormVisible = false;
  }

  /**
   * Limpia el formulario y el estado de envío.
   */
  resetForm(): void {
    this.request = {
      subject: '',
      modality: '',
      message: '',
    };
    this.requestSent = false;
    this.requestFormVisible = false;
  }

  /**
   * Navega de regreso a la vista principal de alumno.
   * Se puede ajustar la ruta según el flujo real de la aplicación.
   */
  onBack(): void {
    this.router.navigate(['/student-home']);
  }
}
