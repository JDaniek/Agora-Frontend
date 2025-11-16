import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router,RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, tap, catchError } from 'rxjs/operators';
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

  /** ====== Endpoints ====== */
  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl  = 'http://localhost:8080/api/v1/profile';

  /** ====== UI State ====== */
  isSidebarOpen = false;
  topAvatarUrl: string | null = null;     // ← foto del usuario en top bar
  isLoadingProfile = false;

  /** ====== Filtros / Catálogos ====== */
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
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit() {
    // 1) Cargar foto del usuario (no rompe si no tiene perfil aún)
    this.loadMyProfile().subscribe(() => {
      // nada extra; sólo actualizamos topAvatarUrl
    });

    // 2) Suscribirse a filtros para listar asesores
    this.filtros.valueChanges.pipe(
      startWith(this.filtros.value),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(filterValues => this.fetchAdvisers(filterValues))
    ).subscribe(mappedData => {
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
        // Otros errores: no bloqueamos la vista
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => { this.isLoadingProfile = false; }),
      map(() => void 0)
    );
  }

  /** ====== Data de asesores ====== */
  fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar)  params = params.set('state', filters.lugar);
    if (filters.nivel)  params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    return this.http.get<AdviserCardResponse[]>(this.advisersApiUrl, { params }).pipe(
      tap(apiResponse => console.log('StudentHome: Datos CRUDOS recibidos de la API', apiResponse)),
      map(apiResponse => apiResponse.map(adviser => this.mapApiToView(adviser)))
    );
  }

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

  /** ====== UI helpers ====== */
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  trackByStr(_i: number, str: string): string { return str; }
  trackById(_i: number, item: AdviserCardView): number { return item.id; }
  clearFilters() { this.filtros.setValue({ search: '', lugar: '', nivel: '', materia: '' }); }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  toggleBookmark(adviser: AdviserCardView) { adviser.bookmarked = !adviser.bookmarked; }
  iconFor(_tag: string): string { return '📚'; }
}
