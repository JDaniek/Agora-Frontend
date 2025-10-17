import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-asesor',
  imports: [],
  templateUrl: './dashboard-asesor.html',
  styleUrl: './dashboard-asesor.css'
})
export class DashboardAsesor {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
    solicitudes = [
    {
      id: 1,
      nombre: 'Carlos Méndez',
      fecha: '16 oct 2025',
      estado: 'Pendiente',
      prioridad: 'Alta'
    },
    {
      id: 2,
      nombre: 'Ana López',
      fecha: '15 oct 2025',
      estado: 'Aprobada',
      prioridad: 'Media'
    },
    {
      id: 3,
      nombre: 'Luis Ramírez',
      fecha: '14 oct 2025',
      estado: 'Rechazada',
      prioridad: 'Baja'
    },]
}
