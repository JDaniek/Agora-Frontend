import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {
  ClassService,
  ClassEnrollmentResponse
} from '../../../../../../core/services/class.service';


@Component({
  selector: 'app-class-enrollment-manage-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './class-enrollment-manage-modal.html',
  styleUrls: ['./class-enrollment-manage-modal.css']
})
export class ClassEnrollmentManageModalComponent implements OnInit {

  @Input() classId!: number;
  @Input() classTitle: string = '';
  @Output() close = new EventEmitter<void>();

  loading = false;
  enrolled: ClassEnrollmentResponse[] = [];

  newStudentId: number | null = null;
  enrolling = false;
  errorMessage: string | null = null;

  constructor(private classService: ClassService) {
  }

  ngOnInit(): void {
    if (!this.classId) {
      console.warn('ClassEnrollmentManageModalComponent: classId no proporcionado');
      return;
    }
    this.loadEnrollments();
  }

  private loadEnrollments(): void {
    this.loading = true;
    this.errorMessage = null;

    this.classService.getClassEnrollments(this.classId).subscribe({
      next: (data) => {
        this.enrolled = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando alumnos de la clase', err);
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los alumnos inscritos.';
      }
    });
  }

  onEnrollById(): void {
    this.errorMessage = null;

    if (!this.newStudentId || this.newStudentId <= 0) {
      this.errorMessage = 'Ingresa un ID de alumno válido.';
      return;
    }

    this.enrolling = true;
    this.classService.enrollStudent(this.classId, this.newStudentId).subscribe({
      next: () => {
        this.enrolling = false;
        this.newStudentId = null;
        this.loadEnrollments(); // recargar lista
      },
      error: (err) => {
        console.error('Error al inscribir alumno', err);
        this.errorMessage = err?.error || 'No se pudo inscribir al alumno.';
        this.enrolling = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
