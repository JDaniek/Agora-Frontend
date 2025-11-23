// mis-solicitudes.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Estados posibles de una solicitud */
export type RequestStatus = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'FINALIZADA';

/* Modelo de solicitud de asesoría */
export interface AdvisorRequest {
  id: number;
  advisorName: string;
  subject: string;
  requestDate: string; // Formato simple, por ejemplo "2025-11-23"
  status: RequestStatus;
  message: string;
  advisorResponse?: string;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-solicitudes.html',
  styleUrls: ['./mis-solicitudes.css']
})
export class MisSolicitudesComponent {
  /* Filtro actual por estado */
  selectedStatusFilter: RequestStatus | 'TODOS' = 'TODOS';

  /* Listado mock de solicitudes del alumno */
  requests: AdvisorRequest[] = [
    {
      id: 1,
      advisorName: 'Ana López',
      subject: 'Cálculo diferencial - Límites',
      requestDate: '2025-11-20',
      status: 'PENDIENTE',
      message:
        'Hola, me gustaría revisar ejercicios de límites antes de mi examen. Tengo dudas con el uso de la definición formal.',
      advisorResponse: undefined
    },
    {
      id: 2,
      advisorName: 'Carlos Ramírez',
      subject: 'Programación orientada a objetos',
      requestDate: '2025-11-18',
      status: 'ACEPTADA',
      message:
        'Buenas tardes, quiero asesoría para repasar herencia y polimorfismo en Java y preparar un proyecto sencillo.',
      advisorResponse:
        'Hola, puedo apoyarte el jueves a las 17:00. Revisaremos ejemplos prácticos y resolveremos tus ejercicios.'
    },
    {
      id: 3,
      advisorName: 'María Gómez',
      subject: 'Inglés B2 - Preparación de examen',
      requestDate: '2025-11-10',
      status: 'FINALIZADA',
      message:
        'Hola, me interesa practicar comprensión lectora y redacción para un examen B2. Busco reforzar conectores y estructura de ensayo.',
      advisorResponse:
        'Gracias por la sesión. Te recomiendo continuar practicando una lectura diaria y escribir resúmenes cortos.'
    },
    {
      id: 4,
      advisorName: 'Luis Hernández',
      subject: 'Bases de datos - Modelado',
      requestDate: '2025-11-15',
      status: 'RECHAZADA',
      message:
        'Buenas, necesito revisar modelo entidad-relación para un proyecto y normalización básica.',
      advisorResponse:
        'Por el momento no tengo disponibilidad en el horario solicitado. Puedes volver a enviar otra solicitud con otro horario.'
    }
  ];

  /* Solicitud seleccionada para ver detalle */
  selectedRequest: AdvisorRequest | null = null;

  constructor() {
    // Por defecto, seleccionamos la primera solicitud (si existe)
    if (this.requests.length > 0) {
      this.selectedRequest = this.requests[0];
    }
  }

  /* Lista filtrada según el estado seleccionado */
  get filteredRequests(): AdvisorRequest[] {
    if (this.selectedStatusFilter === 'TODOS') {
      return this.requests;
    }
    return this.requests.filter(
      req => req.status === this.selectedStatusFilter
    );
  }

  /* Seleccionar una solicitud para mostrar su detalle */
  selectRequest(request: AdvisorRequest): void {
    this.selectedRequest = request;
  }

  /* Cambiar el filtro por estado */
  setStatusFilter(status: RequestStatus | 'TODOS'): void {
    this.selectedStatusFilter = status;

    // Si el elemento seleccionado ya no está en la lista filtrada, limpiamos o seleccionamos otro.
    if (
      this.selectedRequest &&
      !this.filteredRequests.some(r => r.id === this.selectedRequest?.id)
    ) {
      this.selectedRequest = this.filteredRequests[0] || null;
    }
  }

  /* Clase CSS según el estado (para el badge) */
  getStatusClass(status: RequestStatus): string {
    switch (status) {
      case 'PENDIENTE':
        return 'status-pendiente';
      case 'ACEPTADA':
        return 'status-aceptada';
      case 'RECHAZADA':
        return 'status-rechazada';
      case 'FINALIZADA':
        return 'status-finalizada';
      default:
        return '';
    }
  }

  /* Etiqueta legible del estado (por si en el futuro se cambia la representación interna) */
  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ACEPTADA':
        return 'Aceptada';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'FINALIZADA':
        return 'Finalizada';
      default:
        return status;
    }
  }

  /* trackBy para optimizar el *ngFor */
  trackByRequestId(_: number, req: AdvisorRequest): number {
    return req.id;
  }
}
