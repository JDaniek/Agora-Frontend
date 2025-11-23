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

/** Modelos de la API */
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
  /** Endpoints de AGORA-API */
  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';

  /** Estado UI */
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;
  showNotificationsPanel = false;

  /** Filtros y catálogos */
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
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
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
      .subscribe(data => {
        this.advisers = data;
        this.cdr.detectChanges();
      });
  }

  /** Perfil actual */
  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;
      }),
      catchError(err => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return of(null);
        }
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => (this.isLoadingProfile = false)),
      map(() => void 0)
    );
  }

  /** Asesores según filtros */
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
        map(response => response.map(a => this.mapApiToView(a))),
        catchError(err => {
          console.error('Error al obtener asesores', err);
          return of<AdviserCardView[]>([]);
        }),
        tap(() => (this.isLoadingAdvisers = false))
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

  /** Helpers UI */
  trackByStr(_: number, value: string): string {
    return value;
  }

  trackById(_: number, item: AdviserCardView): number {
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

  toggleNotificationsPanel(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
  }

  toggleBookmark(adviser: AdviserCardView): void {
    adviser.bookmarked = !adviser.bookmarked;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  onSeeMore(adviser: AdviserCardView): void {
    console.log('Ver más de asesor', adviser.id);
    // En el futuro se puede navegar a detalle:
    // this.router.navigate(['/asesor', adviser.id]);
  }
}




