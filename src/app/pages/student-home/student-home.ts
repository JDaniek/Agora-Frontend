// student-home.ts
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

/** Modelos para el dashboard */
interface UpcomingSession {
  id: number;
  adviserName: string;
  subject: string;
  date: string;
  time: string;
  mode?: string;
}

interface RequestStatusSummary {
  label: string;
  count: number;
}

interface ActiveCourse {
  id: string;
  name: string;
  subtitle: string;
  progress?: number;
}

interface CalendarDay {
  label: number;
  isToday?: boolean;
  hasSession?: boolean;
}

interface Notice {
  id: string;
  title: string;
  description: string;
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

  /** Estado UI general */
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;
  showNotificationsPanel = false;

  /** Datos del estudiante para la tarjeta de bienvenida */
  studentName = 'Estudiante';
  profileCompletion = 60;

  get studentInitial(): string {
    return this.studentName.charAt(0).toUpperCase();
  }

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

  /** Datos mock para el dashboard */
  upcomingSessions: UpcomingSession[] = [
    {
      id: 1,
      adviserName: 'María López',
      subject: 'Cálculo diferencial',
      date: 'Lun 10',
      time: '16:00',
      mode: 'En línea'
    },
    {
      id: 2,
      adviserName: 'Juan Pérez',
      subject: 'Programación orientada a objetos',
      date: 'Mié 12',
      time: '18:30',
      mode: 'Presencial'
    },
    {
      id: 3,
      adviserName: 'Ana Torres',
      subject: 'Inglés académico',
      date: 'Vie 14',
      time: '17:00',
      mode: 'En línea'
    }
  ];

  requestsSummary: RequestStatusSummary[] = [
    { label: 'Pendientes', count: 2 },
    { label: 'Aceptadas', count: 3 },
    { label: 'Rechazadas', count: 1 }
  ];

  activeCourses: ActiveCourse[] = [
    {
      id: 'calc-1',
      name: 'Cálculo diferencial',
      subtitle: 'Sesión semanal con asesor asignado',
      progress: 70
    },
    {
      id: 'poo-1',
      name: 'Programación orientada a objetos',
      subtitle: 'Apoyo en tareas y proyectos',
      progress: 45
    }
  ];

  currentMonthLabel = 'Mayo 2025';

  calendarDays: CalendarDay[] = [
    { label: 1 },
    { label: 2 },
    { label: 3 },
    { label: 4 },
    { label: 5 },
    { label: 6 },
    { label: 7 },
    { label: 8 },
    { label: 9 },
    { label: 10, isToday: true, hasSession: true },
    { label: 11 },
    { label: 12, hasSession: true },
    { label: 13 },
    { label: 14 },
    { label: 15 },
    { label: 16 },
    { label: 17 },
    { label: 18 },
    { label: 19, hasSession: true },
    { label: 20 },
    { label: 21 },
    { label: 22 },
    { label: 23 },
    { label: 24 },
    { label: 25 },
    { label: 26 },
    { label: 27 },
    { label: 28 },
    { label: 29 },
    { label: 30 }
  ];

  notices: Notice[] = [
    {
      id: 'n1',
      title: 'Nueva solicitud aceptada',
      description:
        'Uno de tus asesores ha aceptado tu solicitud. Revisa la sección de sesiones para confirmar el horario.'
    },
    {
      id: 'n2',
      title: 'Recordatorio de sesión',
      description:
        'Tienes una asesoría programada para esta semana. Verifica los detalles en tu agenda.'
    }
  ];

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
    this.loadStudentFromLocalStorage();
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

  /** Lectura simple de nombre de usuario desde localStorage */
  private loadStudentFromLocalStorage(): void {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.firstName === 'string') {
        this.studentName = parsed.firstName;
      }
    } catch {
      // Si algo falla dejamos el nombre por defecto.
    }
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

  /** Acciones de dashboard (por ahora solo trazas para el líder / back) */
  onEditProfile(): void {
    this.router.navigate(['/complete-profile']);
  }

  onViewAllSessions(): void {
    console.log('StudentHome: ver todas las próximas asesorías');
  }

  onViewRequests(): void {
    console.log('StudentHome: ver detalle de solicitudes');
  }

  onViewCourse(courseId: string): void {
    console.log('StudentHome: ver curso/materia', courseId);
  }

  onViewAllCourses(): void {
    console.log('StudentHome: ver todas las materias activas');
  }

  onViewNotice(noticeId: string): void {
    console.log('StudentHome: ver aviso', noticeId);
  }

  onViewAllNotices(): void {
    console.log('StudentHome: ver todos los avisos');
  }
}





