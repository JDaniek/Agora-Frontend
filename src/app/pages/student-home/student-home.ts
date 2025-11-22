import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
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
  /** Endpoints AGORA-API */
  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';

  /** Estado UI */
  isSidebarOpen = false;
  showNotifications = false;
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;

  /** Catálogos (placeholder hasta conectar catálogo real) */
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: { id: number; name: string }[] = [
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
    // Form de filtros
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit(): void {
    // Cargar avatar del usuario
    this.loadMyProfile().subscribe();

    // Suscripción a filtros
    this.filtros.valueChanges
      .pipe(
        startWith(this.filtros.value),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap(values => this.fetchAdvisers(values))
      )
      .subscribe(cards => {
        this.advisers = cards;
        this.cdr.detectChanges();
      });
  }

  /** Carga de perfil del usuario autenticado */
  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;
      }),
      catchError(err => {
        if (err?.status === 404) {
          this.topAvatarUrl = null;
          return of(null);
        }
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return of(null);
        }
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => {
        this.isLoadingProfile = false;
      }),
      map(() => void 0)
    );
  }

  /** Petición de asesores con filtros */
  private fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http
      .get<AdviserCardResponse[]>(this.advisersApiUrl, { params })
      .pipe(
        tap(apiResponse =>
          console.log('StudentHome: /advisers respuesta cruda', apiResponse)
        ),
        map(res => res.map(item => this.mapApiToView(item))),
        catchError(err => {
          console.error('StudentHome: error al obtener asesores', err);
          return of<AdviserCardView[]>([]);
        }),
        tap(() => {
          this.isLoadingAdvisers = false;
        })
      );
  }

  /** Mapea modelo de API a card de la UI */
  private mapApiToView(adviser: AdviserCardResponse): AdviserCardView {
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

  /** Helpers UI */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  trackByStr(_i: number, str: string): string {
    return str;
  }

  trackById(_i: number, item: AdviserCardView): number {
    return item.id;
  }

  toggleBookmark(adviser: AdviserCardView): void {
    adviser.bookmarked = !adviser.bookmarked;
  }

  onSeeMore(adviser: AdviserCardView): void {
    console.log('StudentHome: ver más asesor', adviser);
    // Aquí después se puede navegar al detalle cuando exista la vista:
    // this.router.navigate(['/asesor', adviser.id]);
  }
}



