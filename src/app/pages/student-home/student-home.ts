import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/** === Modelos que vienen de la API === */
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

/** Perfil para el avatar del usuario logueado */
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
  styleUrls: ['./student-home.css'],
})
export class StudentHome implements OnInit {
  /** Endpoints actuales de AGORA-API */
  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';

  /** Estado de UI */
  isSidebarOpen = false;
  showNotifications = false;

  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;

  /** Catálogos provisionales (se pueden sustituir por catálogos reales) */
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: { id: number; name: string }[] = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    { id: 3, name: 'Artes' },
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
      materia: [''],
    });
  }

  ngOnInit(): void {
    this.loadMyProfile().subscribe();

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

  /** Carga el perfil del usuario para mostrar el avatar en la barra superior */
  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;
      }),
      catchError(err => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
        }
        // 404 u otros errores: simplemente no mostramos avatar
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => {
        this.isLoadingProfile = false;
      }),
      map(() => void 0)
    );
  }

  /** Pide la lista de asesores con los filtros actuales */
  private fetchAdvisers(filters: any): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http
      .get<AdviserCardResponse[]>(this.advisersApiUrl, { params })
      .pipe(
        map(response => response.map(r => this.mapApiToView(r))),
        catchError(err => {
          console.error('Error al obtener asesores', err);
          return of<AdviserCardView[]>([]);
        }),
        tap(() => {
          this.isLoadingAdvisers = false;
        })
      );
  }

  /** Mapea el modelo de API al modelo usado por la UI */
  private mapApiToView(a: AdviserCardResponse): AdviserCardView {
    return {
      id: a.userId,
      name: `${a.firstName} ${a.lastName}`,
      avatarUrl: a.photoUrl,
      nivel: a.level,
      tags: a.specialties ?? [],
      description: a.description,
      bookmarked: false,
    };
  }

  /* === Helpers de UI === */

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
      materia: '',
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  toggleBookmark(card: AdviserCardView): void {
    card.bookmarked = !card.bookmarked;
  }

  onSeeMore(card: AdviserCardView): void {
    // Aquí, cuando exista la pantalla de detalle de asesor,
    // pueden navegar con el id del usuario:
    // this.router.navigate(['/asesor', card.id]);
    console.log('Ver más asesor', card);
  }

  trackByStr(_i: number, v: string): string {
    return v;
  }

  trackById(_i: number, v: AdviserCardView): number {
    return v.id;
  }
}


