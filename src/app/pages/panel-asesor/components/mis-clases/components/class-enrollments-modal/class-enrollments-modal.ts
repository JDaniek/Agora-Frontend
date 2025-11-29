import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// CORRECCIÓN 1: La ruta necesita subir 6 niveles para llegar a 'app' y luego entrar a 'core'
// Basado en tu árbol: pages -> panel-asesor -> components -> mis-clases -> components -> class-enrollments-modal
import { AdviserService } from '../../../../../../core/services/adviser.service';

@Component({
  selector: 'app-class-enrollments-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-enrollments-modal.html',
  styleUrls: ['./class-enrollments-modal.css']
})
export class ClassEnrollmentsModalComponent implements OnInit {
  @Input() classId: number | null = null;
  @Input() classTitle: string = 'Clase';
  @Output() close = new EventEmitter<void>();

  private adviserService = inject(AdviserService);

  students: any[] = [];
  loading = true;

  // Control del formulario de reseña
  expandedStudentId: number | null = null;
  reviewForm = { rating: 5, comment: '' };
  isSubmitting = false;

  ngOnInit() {
    if (this.classId) {
      this.loadEnrollments();
    }
  }

  loadEnrollments() {
    this.loading = true;
    if (!this.classId) return;

    this.adviserService.getClassEnrollments(this.classId).subscribe({
      // CORRECCIÓN 2: Tipado explícito (data: any[])
      next: (data: any[]) => {
        this.students = data;
        this.loading = false;
      },
      // CORRECCIÓN 2: Tipado explícito (err: any)
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  toggleRateForm(studentId: number) {
    if (this.expandedStudentId === studentId) {
      this.expandedStudentId = null;
    } else {
      this.expandedStudentId = studentId;
      this.reviewForm = { rating: 5, comment: '' };
    }
  }

  submitReview(studentId: number) {
    if (!this.reviewForm.comment.trim()) {
      alert('Por favor escribe un comentario.');
      return;
    }

    this.isSubmitting = true;
    this.adviserService.createStudentReview(studentId, this.reviewForm.rating, this.reviewForm.comment).subscribe({
      next: () => {
        alert('Reseña enviada correctamente.');
        this.isSubmitting = false;
        this.expandedStudentId = null;
      },
      // CORRECCIÓN 2: Tipado explícito (err: any)
      error: (err: any) => {
        this.isSubmitting = false;
        console.error(err);
        if (err.status === 409) {
          alert('Ya has calificado a este alumno o hubo un conflicto.');
        } else {
          alert('Error al enviar la calificación.');
        }
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
