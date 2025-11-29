import {Component, OnInit, inject, ChangeDetectorRef} from '@angular/core'; // <--- 1. IMPORTAR
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {AdviserService} from '../../core/services/adviser.service';
import {NotificationRequest} from '../../core/models/advisor.models';
// Importamos el hijo
import {MisClasesComponent} from './components/mis-clases/mis-clases.component';
import {MisChatsComponent} from './components/mis-chats/mis-chats.component';

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, MisClasesComponent, MisChatsComponent],
  templateUrl: './panel-asesor.html',
  styleUrl: './panel-asesor.css'
})
export class PanelAsesor implements OnInit {
  private adviserService = inject(AdviserService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  currentView: 'inicio' | 'clases' | 'chats' | 'resenas' = 'inicio';
  isSidebarOpen = false;

  // DATOS PARA SOLICITUDES (Esto debe quedarse aquí por ahora)
  solicitudes: NotificationRequest[] = [];
  loading = false;
  userName = 'Asesor';

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) this.userName = JSON.parse(userStr).firstName;

    // Cargar solicitudes al inicio
    this.setView('inicio');
    //Cargamos el catalogo de especialidades
  }

  setView(view: any) {
    this.currentView = view;
    if (view === 'inicio') {
      this.loadSolicitudes();
    }
    // Nota: Si es 'clases', el componente hijo <app-mis-clases> se encarga de cargar sus propios datos.
  }

  // --- LÓGICA DE SOLICITUDES (Mantener en el padre) ---
  loadSolicitudes() {
    this.loading = true;
    this.adviserService.getNotifications().subscribe({
      next: (data) => {
        console.log('Datos procesados en componente:', data); // Debug

        // Filtramos pendientes y leídas (mientras no sean rechazadas/aceptadas)
        this.solicitudes = data ? data.filter(n => n.status !== 'declined' && n.status !== 'accepted') : [];

        this.loading = false;
        this.cd.detectChanges(); // <--- 3. OBLIGAR A PINTAR
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges(); // <--- 3. OBLIGAR A PINTAR (incluso en error)
      }
    });
  }

  aceptarSolicitud(id: number) {
    this.loading = true;
    this.adviserService.respondToRequest(id, 'accepted').subscribe({
      next: () => {
        alert('Solicitud aceptada');
        this.loadSolicitudes();
      },
      error: () => this.loading = false
    });
  }

  rechazarSolicitud(id: number) {
    if (!confirm('¿Rechazar solicitud?')) return;
    this.loading = true;
    this.adviserService.respondToRequest(id, 'declined').subscribe({
      next: () => this.loadSolicitudes(),
      error: () => this.loading = false
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout() {
    this.adviserService.logout();
    this.router.navigate(['/login']);
  }
}
