import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  startWith,
  tap,
  catchError
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/** ====== API models ====== */
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

/** Perfil para traer la foto del usuario logueado */
interface ProfileResponse {
  userId: number;
  description: string | null;
  photoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  level: string | null;
  specialties: { id: number; name: string }[];
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit {
  /** ====== Endpoints (coinciden con AGORA-API en Ktor) ====== */
  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';

  /** ====== UI State ====== */
  isSidebarOpen = false;
  topAvatarUrl: string | null = null; // foto del usuario en top bar
  isLoadingProfile = false;
  isLoadingAdvisers = false; // estado de carga para la lista de asesores

  /** ====== Filtros / Catálogos (placeholder hasta conectar catálogos reales) ====== */
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: any[] = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    { id: 3, name: 'Artes' }
  ];

  filtros: FormGroup;
  advisers: AdviserCardView[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // FormGroup que controla todos los filtros de la barra superior
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit(): void {
    // 1) Cargar foto del usuario (no rompe si no tiene perfil aún)
    this.loadMyProfile().subscribe(() => {
      // nada extra; sólo actualizamos topAvatarUrl
    });

    // 2) Suscribirse a los cambios del formulario de filtros
    //    Para cada cambio, llamamos a la API de asesores.
    this.filtros.valueChanges
      .pipe(
        // startWith: dispara una primera carga con los filtros por defecto
        startWith(this.filtros.value),
        // debounce: evitamos disparar la API por cada tecla
        debounceTime(300),
        // distinctUntilChanged: solo reaccionamos si cambió algo realmente
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        // switchMap: cancela la petición anterior si el usuario cambia filtros rápido
        switchMap(filterValues => this.fetchAdvisers(filterValues))
      )
      .subscribe(mappedData => {
        this.advisers = mappedData;
        this.cdr.detectChanges();
      });
  }

  /** ====== Cargar perfil del usuario autenticado ====== */
  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;
      }),
      catchError(err => {
        if (err?.status === 404) {
          // No hay perfil creado: avatar por defecto (null)
          this.topAvatarUrl = null;
          return of(null);
        }
        if (err?.status === 401) {
          // Sesión expirada → a login
          this.router.navigate(['/login']);
          return of(null);
        }
        // Otros errores: no bloqueamos la vista principal
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => {
        this.isLoadingProfile = false;
      }),
      map(() => void 0)
    );
  }

  /** ====== Data de asesores ====== */
  fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    // Mapeo filtros → query params del backend
    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http
      .get<AdviserCardResponse[]>(this.advisersApiUrl, { params })
      .pipe(
        tap(apiResponse =>
          console.log(
            'StudentHome: datos crudos recibidos de la API /advisers',
            apiResponse
          )
        ),
        map(apiResponse => apiResponse.map(adviser => this.mapApiToView(adviser))),
        catchError(err => {
          console.error('StudentHome: error al obtener asesores', err);
          // En caso de error devolvemos lista vacía para no romper la vista
          return of<AdviserCardView[]>([]);
        }),
        tap(() => {
          this.isLoadingAdvisers = false;
        })
      );
  }

  /** Mapea el modelo de la API al modelo de la tarjeta de la UI */
  private mapApiToView(adviser: AdviserCardResponse): AdviserCardView {
    return {
      id: adviser.userId,
      name: `${adviser.firstName} ${adviser.lastName}`,
      avatarUrl: adviser.photoUrl,
      nivel: adviser.level,
      // specialties viene como string[], lo usamos tal cual como "tags"
      tags: adviser.specialties,
      description: adviser.description,
      // Estado inicial del bookmark solo es local (no persistimos aún)
      bookmarked: false
    };
  }

  /** ====== UI helpers ====== */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  trackByStr(_i: number, str: string): string {
    return str;
  }

  trackById(_i: number, item: AdviserCardView): number {
    return item.id;
  }

  clearFilters(): void {
    this.filtros.setValue({
      search: '',
      lugar: '',
      nivel: '',
      materia: ''
    });
  }

  logout(): void {
    // Limpiamos la sesión básica en el cliente
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  toggleBookmark(adviser: AdviserCardView): void {
    // Por ahora solo cambia el estado en memoria.
    // Si en el futuro se requiere persistir favoritos,
    // aquí podríamos llamar a un endpoint /favorites.
    adviser.bookmarked = !adviser.bookmarked;
  }

  iconFor(_tag: string): string {
    // En caso de querer iconos por tipo de tag,
    // aquí se puede aplicar lógica de mapeo (ej: idioma, matemáticas, etc.).
    return '📚';
  }

  /** Handler para el botón "Ver más" de cada card */
  onSeeMore(adviser: AdviserCardView): void {
    console.log('StudentHome: ver más detalles de asesor', adviser);
    // TODO: cuando exista la pantalla de detalle de asesor,
    // podríamos navegar con su id:
    // this.router.navigate(['/asesor', adviser.id]);
  }
}

