import {Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AdviserService} from '../../../../../../core/services/adviser.service';

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
  private cd = inject(ChangeDetectorRef);

  students: any[] = [];
  loading = true;

  // Control del formulario de reseña
  expandedStudentId: number | null = null;
  reviewForm = {rating: 5, comment: ''};
  isSubmitting = false;

  ngOnInit() {
    if (this.classId) {
      this.loadEnrollments();
    } else {
      this.loading = false;
    }
  }

  loadEnrollments() {
    if (!this.classId) {
      this.loading = false;
      this.cd.detectChanges();
      return;
    }

    this.loading = true;

    this.adviserService.getClassEnrollments(this.classId).subscribe({
      next: (data: any[]) => {
        console.log('✅ Alumnos recibidos (con foto/nombre):', data);
        this.students = data;
        this.loading = false;
        this.cd.detectChanges(); // Forzamos actualización visual
      },
      error: (err: any) => {
        console.error('Error cargando alumnos:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  toggleRateForm(studentId: number) {
    if (this.expandedStudentId === studentId) {
      this.expandedStudentId = null; // Cerrar si ya está abierto
    } else {
      this.expandedStudentId = studentId;
      this.reviewForm = {rating: 5, comment: ''}; // Resetear form
    }
  }

  submitReview(studentId: number) {
    if (!this.reviewForm.comment.trim()) {
      alert('Por favor escribe un comentario.');
      return;
    }

    this.isSubmitting = true;

    this.adviserService.createStudentReview(
      studentId,
      this.reviewForm.rating,
      this.reviewForm.comment
    ).subscribe({
      next: () => {
        alert('Reseña enviada correctamente.');
        this.isSubmitting = false;
        this.expandedStudentId = null; // Cerrar form tras éxito
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error(err);

        const errorMsg = err.error?.error;
        if (err.status === 409) {
          alert(errorMsg || 'Ya has calificado a este alumno o hubo un conflicto.');
        } else {
          alert('Error al enviar la calificación.');
        }
        this.cd.detectChanges();
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
