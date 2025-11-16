import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router'; // AÑADE RouterOutlet
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs'; // AÑADE Subscription
import { filter } from 'rxjs/operators'; // Añade filter

import { SidebarService } from '../../core/services/sidebar';

// (Tus interfaces siguen igual)
interface AdviserCardResponse {
  userId: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  level: string | null;
  description: string | null;
  specialties: string[];
}
interface AdviserCardView {
  id: number;
  name: string;
  avatarUrl: string | null;
  nivel: string | null;
  tags: string[];
  description: string | null;
  bookmarked: boolean;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  // 2. AÑADE RouterOutlet AQUÍ
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink 
  ],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit, OnDestroy { // AÑADE OnDestroy
  public isChatRoute: boolean = false;
  private routerSubscription!: Subscription; // Para limpiar el listener del router

  // ... (Tus propiedades existentes)
  private apiUrl = 'http://localhost:8080/api/v1/advisers';
  
  // Esta variable sigue siendo útil para el HTML local
  isSidebarOpen = false;
  private sidebarSubscription!: Subscription; // Para limpiar la suscripción

  lugares: string[] = ["CHIS", "JAL", "CDMX", "NL"];
  niveles: string[] = ["Bachillerato", "Universidad", "Maestría"];
  materias: any[] = [
    { id: 1, name: "Ciencias Naturales" },
    { id: 2, name: "Idiomas" },
    { id: 3, name: "Artes" }
  ];
  filtros: FormGroup;
  advisers: AdviserCardView[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    // 3. INYECTA EL SERVICIO DEL SIDEBAR
    private sidebarService: SidebarService
  ) {
    // Escucha los cambios de ruta para saber si mostrar el chat o el home
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Comprueba si la URL actual es una de las de chat
      this.isChatRoute = event.url.startsWith('/chat-alumno') || event.url.startsWith('/chat-tutor');
    });
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit() {
    // --- 4. SUSCRÍBETE AL SERVICIO DEL SIDEBAR ---
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
      // Opcional: Forzar detección de cambios si el sidebar no reacciona
      // this.cdr.detectChanges(); 
    });

    // (Tu lógica de filtros existente)
    this.filtros.valueChanges.pipe(
      startWith(this.filtros.value),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(filterValues => this.fetchAdvisers(filterValues))
    ).subscribe(mappedData => {
      console.log("StudentHome: Datos RECIBIDOS", mappedData);
      this.advisers = mappedData;
      this.cdr.detectChanges();
    });
  }

  // 5. LIMPIA LA SUSCRIPCIÓN
  ngOnDestroy(): void {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  // --- 6. MODIFICA LAS FUNCIONES DEL SIDEBAR ---
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

  // (El resto de tus funciones siguen igual)
  fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    // ... (tu código existente de fetchAdvisers)
    let params = new HttpParams();
    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    return this.http.get<AdviserCardResponse[]>(this.apiUrl, { params }).pipe(
      // tap(apiResponse => console.log("Datos CRUDOS", apiResponse)),
      map(apiResponse => apiResponse.map(adviser => this.mapApiToView(adviser)))
    );
  }

  private mapApiToView(adviser: AdviserCardResponse): AdviserCardView {
     // ... (tu código existente de mapApiToView)
     return {
      id: adviser.userId,
      name: `${adviser.firstName} ${adviser.lastName}`,
      avatarUrl: adviser.photoUrl,
      nivel: adviser.level,
      tags: adviser.specialties,
      description: adviser.description,
      bookmarked: false
    };
  }

  trackByStr(index: number, str: string): string { return str; }
  trackById(index:number, item: AdviserCardView): number { return item.id; }
  clearFilters() {
    this.filtros.setValue({ search: '', lugar: '', nivel: '', materia: '' });
  }
  toggleBookmark(adviser: AdviserCardView) { adviser.bookmarked = !adviser.bookmarked; }
  iconFor(tag: string): string { return '📚'; }
}