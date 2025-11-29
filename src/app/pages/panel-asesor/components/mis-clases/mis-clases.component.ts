import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdviserService, ClassResponse, Specialty } from '../../../../core/services/adviser.service';

// Modal
import { ClassEnrollmentsModalComponent } from './components/class-enrollments-modal/class-enrollments-modal';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-mis-clases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClassEnrollmentsModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './mis-clases.component.html',
  styleUrls: ['./mis-clases.component.css'],
})
export class MisClasesComponent implements OnInit {
  private adviserService = inject(AdviserService);
  private cd = inject(ChangeDetectorRef);

  clases: ClassResponse[] = [];
  loading = false;

  specialtiesList: Specialty[] = [];

  isEditModalOpen = false;
  editingClass: Partial<ClassResponse> = {};

  isEnrollmentsModalOpen = false;
  selectedClassIdForEnrollment: number | null = null;
  selectedClassTitle: string = '';

  ngOnInit() {
    this.loadClases();
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.adviserService.getSpecialties().subscribe(data => {
      this.specialtiesList = data;
    });
  }

  loadClases() {
    this.loading = true;
    this.adviserService.getMyClasses().subscribe({
      next: (data) => {
        this.clases = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  openCreateModal() {
    this.editingClass = {
      title: '',
      description: '',
      classDate: '',
      capacityPerSlot: 5,
      isActive: true,
      specialtyId: undefined,
    };
    this.isEditModalOpen = true;
  }

  openEditModal(clase: ClassResponse) {
    this.editingClass = {
      ...clase,
      classDate: clase.classDate ? String(clase.classDate).split('T')[0] : '',
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingClass = {};
  }

  saveClassChanges() {
    if (!this.editingClass.id && !this.editingClass.specialtyId) {
      alert('Debes ingresar el ID de la materia (Specialty ID).');
      return;
    }

    this.loading = true;

    if (this.editingClass.id) {
      this.adviserService.updateClass(this.editingClass.id, this.editingClass).subscribe({
        next: () => {
          alert('Clase actualizada');
          this.closeEditModal();
          this.loadClases();
        },
        error: () => {
          this.loading = false;
          alert('Error al actualizar');
        }
      });
    } else {
      this.adviserService.createClass(this.editingClass).subscribe({
        next: () => {
          alert('Clase creada');
          this.closeEditModal();
          this.loadClases();
        },
        error: () => {
          this.loading = false;
          alert('Error al crear');
        }
      });
    }
  }

  onDeleteClass(id: number) {
    if (!confirm(`¿Eliminar la clase con ID ${id}?`)) return;

    this.loading = true;
    this.adviserService.deleteClass(id).subscribe({
      next: () => {
        this.loadClases();
      },
      error: () => {
        this.loading = false;
        alert('Error al eliminar');
      }
    });
  }

  openEnrollments(clase: ClassResponse) {
    this.selectedClassIdForEnrollment = clase.id;
    this.selectedClassTitle = clase.title;
    this.isEnrollmentsModalOpen = true;
  }

  closeEnrollments() {
    this.isEnrollmentsModalOpen = false;
    this.selectedClassIdForEnrollment = null;
    this.selectedClassTitle = '';
  }
}
