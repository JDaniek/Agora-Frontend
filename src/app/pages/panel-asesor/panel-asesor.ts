import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

import {AdviserService} from '../../core/services/adviser.service';
import {NotificationRequest} from '../../core/models/advisor.models';

// hijos
import {MisClasesComponent} from './components/mis-clases/mis-clases.component';
import {MisChatsComponent} from './components/mis-chats/mis-chats.component';
import {MisResenasComponent} from './components/mis-resenas/mis-resenas.component';
import {ProfileService} from '../../core/services/profile.service';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, MisClasesComponent, MisChatsComponent, MisResenasComponent, LucideAngularModule],
  templateUrl: './panel-asesor.html',
  styleUrl: './panel-asesor.css'
})
export class PanelAsesor implements OnInit {
  private adviserService = inject(AdviserService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private profileService = inject(ProfileService);

  currentView: 'inicio' | 'clases' | 'chats' | 'resenas' = 'inicio';

  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;

  solicitudes: NotificationRequest[] = [];
  loading = false;

  userName = 'Asesor';
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.firstName || this.userName;
    }

    this.loadProfile();
    this.setView('inicio');
  }

  private loadProfile() {
    this.isLoadingProfile = true;
    this.profileService.getMyProfile().subscribe({
      next: (p: any) => {
        this.userName = p?.firstName || p?.name || this.userName;
        this.topAvatarUrl = p?.photoUrl ?? p?.avatarUrl ?? null;
        this.isLoadingProfile = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando perfil del asesor', err);
        this.isLoadingProfile = false;
      }
    });
  }

  setView(view: 'inicio' | 'clases' | 'chats' | 'resenas') {
    this.currentView = view;
    if (view === 'inicio') {
      this.loadSolicitudes();
    }
  }

  // --- SOLICITUDES ---
  loadSolicitudes() {
    this.loading = true;
    this.adviserService.getNotifications().subscribe({
      next: (data) => {
        this.solicitudes = data
          ? data.filter(n => n.status !== 'declined' && n.status !== 'accepted')
          : [];
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

  aceptarSolicitud(id: number) {
    this.loading = true;

    this.adviserService.respondToRequest(id, 'accepted').subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);
        alert('¡Solicitud aceptada! Se ha creado el chat.');
        this.loadSolicitudes();
      },
      error: (err) => {
        console.error('❌ Error al aceptar:', err);
        this.loading = false;

        if (err.status === 404) {
          alert('La solicitud ya no existe o caducó.');
        } else if (err.status === 409) {
          alert('Esta solicitud ya fue procesada anteriormente.');
        } else {
          alert('Ocurrió un error al conectar con el servidor.');
        }

        this.cd.detectChanges();
      }
    });
  }

  rechazarSolicitud(id: number) {
    if (!confirm('¿Rechazar solicitud?')) return;
    this.loading = true;
    this.adviserService.respondToRequest(id, 'declined').subscribe({
      next: () => this.loadSolicitudes(),
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- Navegación / sidebar ---
  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  // Igual que student-home
  onEditProfile() {
    this.router.navigate(['/complete-profile'], {
      queryParams: {redirectTo: 'advisor'}
    });
  }

  logout() {
    this.adviserService.logout();
    this.router.navigate(['/login']);
  }
}
