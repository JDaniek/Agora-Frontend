import { Component, OnInit, OnDestroy } from '@angular/core'; // 1. Añade OnInit, OnDestroy
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // 2. Añade CommonModule
import { RouterOutlet } from '@angular/router'; // 3. AÑADE ROUTER-OUTLET
import { Subscription } from 'rxjs'; // 4. Añade Subscription
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../core/services/sidebar';
@Component({
  selector: 'app-dashboard-asesor',
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './dashboard-asesor.html',
  styleUrl: './dashboard-asesor.css'
})
export class DashboardAsesor implements OnInit, OnDestroy { // o StudentHome

  public isChatRoute: boolean = false;
  private routerSubscription!: Subscription;

  public isSidebarOpen: boolean = false; // Esta es la variable de tu compañero
  private sidebarSubscription!: Subscription;

  // 7. INYECTA EL SERVICIO
  constructor(
    private router: Router,
    private sidebarService: SidebarService
    // ...otros servicios que ya tengas
  ) {
    // Escucha los cambios de ruta
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Comprueba si la URL actual es la de chat-tutor
      this.isChatRoute = event.url.startsWith('/chat-tutor');
    });
  }

  // 8. SUSCRÍBETE AL SERVICIO
  ngOnInit(): void {
    // Escucha al servicio y actualiza la variable local
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });
  }

  // 9. LIMPIA LA SUSCRIPCIÓN (Buena práctica)
  ngOnDestroy(): void {
 // Añade la limpieza del router
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  // 10. MODIFICA SUS FUNCIONES para que "hablen" al servicio
  toggleSidebar() { 
    this.sidebarService.toggle();
  }
  
  closeSidebar() { 
    this.sidebarService.close();
  }

  logout() {
    this.sidebarService.close(); // Cierra el sidebar al salir
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
