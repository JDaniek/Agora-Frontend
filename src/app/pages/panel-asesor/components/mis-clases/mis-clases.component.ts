import {Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AdviserService, ClassResponse} from '../../../../core/services/adviser.service';
import {Specialty} from '../../../../core/services/adviser.service'; // Importar la interfaz
@Component({
  selector: 'app-mis-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-clases.component.html',
  styleUrls: ['./mis-clases.component.css']
})
export class MisClasesComponent implements OnInit {
  private adviserService = inject(AdviserService);
  private cd = inject(ChangeDetectorRef);
  clases: ClassResponse[] = [];
  loading = false;
// Variable para guardar la lista
  specialtiesList: Specialty[] = [];
  // Variables para el Modal
  isEditModalOpen = false;
  editingClass: Partial<ClassResponse> = {};

  ngOnInit() {
    this.loadClases();
    this.loadSpecialties(); // <--- Llamada a la carga
  }


//Peticion de catalogo
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
        this.cd.detectChanges(); // <--- 3. OBLIGAR A PINTAR
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges(); // <--- 3. OBLIGAR A PINTAR
      }
    });
  }

  // --- Lógica del Modal ---
  openCreateModal() {
    this.editingClass = {
      title: '',
      description: '',
      classDate: '',
      capacityPerSlot: 5,
      isActive: true,
      specialtyId: undefined
    };
    this.isEditModalOpen = true;
  }

  openEditModal(clase: ClassResponse) {
    this.editingClass = {
      ...clase,
      // Ajuste de fecha para input type="date"
      classDate: clase.classDate ? String(clase.classDate).split('T')[0] : ''
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingClass = {};
  }

  saveClassChanges() {
    // Validación rápida de ID de especialidad
    if (!this.editingClass.id && !this.editingClass.specialtyId) {
      alert('Debes ingresar el ID de la materia (Specialty ID).');
      return;
    }

    this.loading = true;

    if (this.editingClass.id) {
      // EDICIÓN
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
      // CREACIÓN
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
}
