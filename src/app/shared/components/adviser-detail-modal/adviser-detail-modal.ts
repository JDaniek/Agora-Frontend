import {Component, Input, Output, EventEmitter, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

// 1. IMPORT NECESARIO PARA USAR <lucide-icon> EN EL HTML
import {LucideAngularModule} from 'lucide-angular';

import {AdviserService, ReviewResponse, ReviewSummary} from '../../../core/services/adviser.service';

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
  // 2. AGREGAR LucideAngularModule AQUÍ
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './adviser-detail-modal.html',
  styleUrls: ['./adviser-detail-modal.css']
})
export class AdviserDetailModalComponent implements OnInit {

  @Input() advisorId: number | null = null;
  @Input() adviser: AdviserDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  private adviserService = inject(AdviserService);

  currentTab: 'perfil' | 'clases' | 'resenas' = 'perfil';

  classes: any[] = [];
  reviews: ReviewResponse[] = [];
  summary: ReviewSummary = {averageRating: 0, totalReviews: 0};

  // 3. PROPIEDAD FALTANTE: Array para iterar estrellas en el HTML
  readonly stars = [1, 2, 3, 4, 5];

  newReview: { rating: number; comment: string } = {
    rating: 5,
    comment: ''
  };

  isSubmittingReview = false;
  loadingContact = false;

  ngOnInit() {
    const id = this.advisorId || this.adviser?.id;
    if (id) {
      this.loadSummary(id);
    }
  }

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

  loadSummary(id: number) {
    this.adviserService.getTeacherSummary(id).subscribe({
      next: (data) => (this.summary = data),
      error: (err) => {
        console.error('Error cargando resumen', err);
        this.summary = {averageRating: 0, totalReviews: 0};
      }
    });
  }

  loadClasses(id: number) {
    this.adviserService.getAdviserClasses(id).subscribe({
      next: (data: any[]) => (this.classes = data),
      error: (err: any) => console.error('Error cargando clases', err)
    });
  }

  loadReviews(id: number) {
    this.adviserService.getTeacherReviews(id).subscribe({
      next: (data) => (this.reviews = data),
      error: (err) => {
        console.error('Error cargando reseñas', err);
        this.reviews = [];
      }
    });
  }

  // 4. MÉTODO FALTANTE: Manejar cambio de rating
  onRatingChange(val: any) {
    this.newReview.rating = Number(val);
  }

  submitReview() {
    const id = this.advisorId || this.adviser?.id;
    if (!id) return;

    if (!this.newReview.comment.trim()) {
      alert('Por favor, escribe un comentario.');
      return;
    }

    this.isSubmittingReview = true;

    this.adviserService
      .createTeacherReview(id, this.newReview.rating, this.newReview.comment)
      .subscribe({
        next: () => {
          alert('Reseña publicada.');

          setTimeout(() => {
            this.newReview = {rating: 5, comment: ''};
            this.loadReviews(id);
            this.loadSummary(id);
            this.isSubmittingReview = false;
          });
        },
        error: (err: any) => {
          this.isSubmittingReview = false;
          console.error(err);
          const errorMsg = err.error?.error;
          if (err.status === 409) alert(errorMsg || 'No puedes dejar reseña.');
          else if (err.status === 400) alert(errorMsg || 'Datos inválidos.');
          else alert('Ocurrió un error.');
        }
      });
  }

  solicitarContacto() {
    const effectiveId = this.advisorId || (this.adviser ? this.adviser.id : null);
    if (!effectiveId) return;

    if (!confirm('¿Deseas enviar una solicitud de contacto?')) return;

    this.loadingContact = true;

    this.adviserService.contactAdviser(effectiveId).subscribe({
      next: () => {
        alert('Solicitud enviada.');
        this.loadingContact = false;
        this.onClose();
      },
      error: (err: any) => {
        console.error(err);
        this.loadingContact = false;
        alert('Error al contactar.');
      }
    });
  }

  onClose() {
    this.close.emit();
    this.closeModal.emit();
  }
}
