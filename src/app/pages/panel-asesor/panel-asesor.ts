import {Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {AdviserService} from '../../core/services/adviser.service';
import {NotificationRequest} from '../../core/models/advisor.models';
import {ClassResponse} from '../../core/services/adviser.service'; // Importar la nueva interfaz
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-asesor.html',
  styleUrl: './panel-asesor.css'
})
export class PanelAsesor implements OnInit {
  private adviserService = inject(AdviserService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef); // <--- INYECTARLO AQUÍ
  // Control de vista
  currentView: 'inicio' | 'clases' | 'chats' | 'resenas' = 'inicio';
  isSidebarOpen = false;
// --- VARIABLES PARA EDICIÓN ---
  isEditModalOpen = false;
  editingClass: Partial<ClassResponse> = {}; // Objeto temporal para el formulario
  // Datos
  solicitudes: NotificationRequest[] = [];
  clases: ClassResponse[] = []; // <--- NUEVO ARRAY para clase
  loading = false;
  userName = 'Asesor';

  ngOnInit() {
    // Recuperar nombre del user para el saludo
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.firstName || 'Asesor';
    }

    this.setView('inicio');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  setView(view: 'inicio' | 'clases' | 'chats' | 'resenas') {
    this.currentView = view;

    if (view === 'inicio') {
      this.loadSolicitudes();
    } else if (view === 'clases') {
      this.loadClases(); //Cargamos las clases
    }
    // Aquí cargaríamos clases o chats cuando selecciones esas vistas
  }

//Funcion para cargar clases
  loadClases() {
    this.loading = true;
    this.adviserService.getMyClasses().subscribe({
      next: (data: any[]) => {
        // Mapeo simple por si el backend devuelve nombres diferentes,
        // o asignación directa si coinciden.
        this.clases = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando clases', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

//Funcion y logica para eliminar
  // --- LÓGICA ELIMINAR ---
  onDeleteClass(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.')) {
      return;
    }

    this.loading = true;
    this.adviserService.deleteClass(id).subscribe({
      next: () => {
        alert('Clase eliminada correctamente');
        this.loadClases(); // Recargar la lista
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Error al eliminar la clase');
      }
    });
  }

//Funcion y logica para editar (Modal)
  openEditModal(clase: ClassResponse) {
    // Clonamos el objeto para no modificar la vista hasta guardar
    // Y formateamos la fecha para que el input type="date" la lea (YYYY-MM-DD)
    this.editingClass = {
      ...clase,
      classDate: clase.classDate ? clase.classDate.split('T')[0] : ''
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingClass = {};
  }

  saveClassChanges() {
    if (!this.editingClass.id) return;

    this.loading = true;
    // Llamamos al servicio
    this.adviserService.updateClass(this.editingClass.id, this.editingClass).subscribe({
      next: (updatedClass) => {
        alert('Clase actualizada con éxito');
        this.closeEditModal();
        this.loadClases(); // Recargar lista
      },
      error: (err) => {
        console.error('Error actualizando:', err);
        this.loading = false;
        alert('No se pudo actualizar la clase. Verifica los datos.');
      }
    });
  }

  //
  loadSolicitudes() {
    console.log('1. Iniciando carga de solicitudes...');
    this.loading = true;

    this.adviserService.getNotifications().subscribe({
      next: (data) => {
        console.log('2. Datos recibidos del servicio (ya mapeados):', data);

        // Verificamos si data es null o undefined
        if (!data) {
          console.warn('Recibimos data vacía o nula');
          this.solicitudes = [];
        } else {
          // Filtramos las pendientes
          this.solicitudes = data.filter(n => {
            // Ajusta esto si tu status es 'read' y quieres verlas
            // Si el status es 'read', NO es 'declined' ni 'accepted', así que PASA el filtro.
            return n.status !== 'declined' && n.status !== 'accepted';
          });
        }

        console.log('3. Solicitudes filtradas para mostrar:', this.solicitudes);

        this.loading = false;
        this.cd.detectChanges(); // <--- FORZAMOS A ANGULAR A PINTAR (Si fuera race condition, esto lo arregla)
      },
      error: (err) => {
        console.error('X. Error CRÍTICO en loadSolicitudes:', err);
        this.loading = false; // Importante apagar el loading incluso si falla
        this.cd.detectChanges(); // Forzar pintado del error o estado vacío
      }
    });
  }

  aceptarSolicitud(id: number) {
    this.loading = true;
    this.adviserService.respondToRequest(id, 'accepted').subscribe({
      next: () => {
        alert('¡Solicitud aceptada! Se ha creado un chat con el alumno.');
        this.loadSolicitudes(); // Recargar la lista limpia
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Error al aceptar la solicitud');
      }
    });
  }

  rechazarSolicitud(id: number) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud?')) return;

    this.loading = true;
    this.adviserService.respondToRequest(id, 'declined').subscribe({
      next: () => {
        this.loadSolicitudes();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  logout() {
    this.adviserService.logout();
    this.router.navigate(['/login']);
  }
}
