import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {
  AdviserService,
  ReviewResponse,
  ReviewSummary
} from '../../../core/services/adviser.service';

// Interfaces para reseñas en el modal (mock antiguo, las dejamos por compatibilidad si las uses en otros lados)
export interface Review {
  userPhoto: string | null;
  userName: string;
  text: string;
  rating: number;
}

export interface AdviserDetail {
  id: number;
  name: string;
  avatarUrl: string | null;
  nivel: string | null;
  description: string | null;
  tags: string[];
  rating?: number;
  reviews?: Review[];
  subject?: string | null;
  location?: string | null;
  bookmarked?: boolean;
}

@Component({
  selector: 'app-adviser-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adviser-detail-modal.html',
  styleUrls: ['./adviser-detail-modal.css']
})
export class AdviserDetailModalComponent implements OnInit {
  @Input() advisorId: number | null = null;
  // Soporte para pasar el objeto completo si lo prefieres
  @Input() adviser: AdviserDetail | null = null;

  @Output() close = new EventEmitter<void>();
  // Alias para compatibilidad con código anterior
  @Output() closeModal = new EventEmitter<void>();

  private adviserService = inject(AdviserService);

  currentTab: 'perfil' | 'clases' | 'resenas' = 'perfil';

  // Datos
  classes: any[] = [];
  reviews: ReviewResponse[] = [];
  summary: ReviewSummary = {averageRating: 0, totalReviews: 0};

  // Formulario Nueva Reseña
  newReview = {rating: 5, comment: ''};
  isSubmittingReview = false;
  loadingContact = false;

  ngOnInit() {
    const id = this.advisorId || this.adviser?.id;
    if (id) {
      // Cargar resumen siempre (para mostrar estrellitas en el header)
      this.loadSummary(id);
      // Clases y reseñas se cargan lazy según pestaña
    }
  }

  // --- Tabs con carga lazy ---
  setTab(tab: 'perfil' | 'clases' | 'resenas') {
    this.currentTab = tab;
    const id = this.advisorId || this.adviser?.id;
    if (!id) return;

    if (tab === 'clases' && this.classes.length === 0) {
      this.loadClasses(id);
    }
    if (tab === 'resenas' && this.reviews.length === 0) {
      this.loadReviews(id);
    }
  }

  // --- Carga de datos ---

  loadSummary(id: number) {
    this.adviserService.getTeacherSummary(id).subscribe({
      next: (data) => (this.summary = data),
      error: (err) => {
        console.error('Error cargando resumen de reseñas', err);
        this.summary = {averageRating: 0, totalReviews: 0};
      }
    });
  }

  loadClasses(id: number) {
    this.adviserService.getAdviserClasses(id).subscribe({
      next: (data: any[]) => (this.classes = data),
      error: (err: any) =>
        console.error('Error cargando clases del profe', err)
    });
  }

  loadReviews(id: number) {
    this.adviserService.getTeacherReviews(id).subscribe({
      next: (data) => (this.reviews = data),
      error: (err) => {
        console.error('Error cargando reseñas del profe', err);
        this.reviews = [];
      }
    });
  }

  // --- Envío de reseña (versión mejorada) ---

  submitReview() {
    const id = this.advisorId || this.adviser?.id;
    if (!id) return;

    // Validación local simple
    if (!this.newReview.comment.trim()) {
      alert('Por favor, escribe un comentario sobre tu experiencia.');
      return;
    }

    this.isSubmittingReview = true;

    this.adviserService.createTeacherReview(id, this.newReview.rating, this.newReview.comment).subscribe({
      next: () => {
        alert('¡Tu reseña ha sido publicada con éxito!');
        this.newReview = {rating: 5, comment: ''}; // Limpiar form
        this.loadReviews(id); // Recargar lista para ver la nueva
        this.loadSummary(id); // Actualizar estrellitas
        this.isSubmittingReview = false;
      },
      error: (err: any) => {
        this.isSubmittingReview = false;
        console.error('Error al enviar reseña:', err);

        // --- MANEJO DE ERRORES UX ---
        const errorMsg = err.error?.error; // Intentamos leer el mensaje del backend

        if (err.status === 409) {
          // Caso: Conflict (Regla de negocio violada)
          // El backend dice: "No has completado una clase con este profesor" o "Ya dejaste reseña"
          alert(
            errorMsg ||
            'No puedes dejar una reseña todavía. Asegúrate de haber completado una clase con este profesor.'
          );
        } else if (err.status === 400) {
          // Caso: Bad Request (Autoevaluación o datos mal formados)
          if (errorMsg?.includes('mismo')) {
            alert('No puedes dejarte una reseña a ti mismo.');
          } else {
            alert(errorMsg || 'Datos inválidos. Verifica tu comentario.');
          }
        } else if (err.status === 401) {
          alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
          // Opcional: redirigir al login o cerrar modal
        } else {
          // Caso genérico
          alert(
            'Ocurrió un error inesperado al enviar tu reseña. Inténtalo más tarde.'
          );
        }
      }
    });
  }

  // --- Contacto ---

  solicitarContacto() {
    const effectiveId = this.advisorId || this.adviser?.id || null;
    if (!effectiveId) return;

    if (!confirm('¿Deseas enviar una solicitud de contacto?')) return;

    this.loadingContact = true;

    this.adviserService.contactAdviser(effectiveId).subscribe({
      next: () => {
        alert('Solicitud enviada con éxito.');
        this.loadingContact = false;
        this.onClose();
      },
      error: (err: any) => {
        console.error(err);
        this.loadingContact = false;
        alert('Error al contactar (¿Ya existe solicitud?).');
      }
    });
  }

  // --- Cierre ---

  onClose() {
    this.close.emit();
    this.closeModal.emit(); // Emitimos ambos por compatibilidad
  }
}
