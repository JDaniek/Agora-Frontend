// student-home.component.ts
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
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

/** Modelo usado en la UI y para filtrado local */
interface AdviserCardView {
  id: number;
  name: string;
  avatarUrl: string | null;
  nivel: string | null;
  tags: string[];
  description: string | null;
  bookmarked: boolean;
  /** Campos para filtrado local */
  subject?: string | null;
  location?: string | null;
}

/** Perfil para la barra superior */
interface ProfileResponse {
  userId: number;
  description: string | null;
  photoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  level: string | null;
  specialties: { id: number; name: string }[];
}

/** Sesiones de agenda (datos locales) */
interface Session {
  id: number;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  subject: string;
  advisor: string;
  modality?: 'En línea' | 'Presencial';
}

/** Día renderizado en el calendario */
interface CalendarDay {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isToday: boolean;
  hasSessions: boolean;
}

/** Avisos locales */
interface Notice {
  id: string;
  title: string;
  text: string;
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

  /** Estado del menú lateral */
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  activeSection = 'inicio';

  /** Filtros y catálogos */
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: { id: number; name: string }[] = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    { id: 3, name: 'Artes' }
  ];

  filtros: FormGroup;

  /** Data de asesores */
  allAdvisers: AdviserCardView[] = []; // dataset completo (API o mock)
  advisers: AdviserCardView[] = []; // dataset filtrado y mostrado

  /** Perfil (por ahora, progreso mock) */
  profileCompletion = 60;

  /** Agenda y calendario (datos locales) */
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  upcomingSessions: Session[] = [
    {
      id: 1,
      date: '2025-11-25',
      time: '10:00',
      subject: 'Cálculo diferencial',
      advisor: 'Ana López',
      modality: 'En línea'
    },
    {
      id: 2,
      date: '2025-11-25',
      time: '16:30',
      subject: 'Programación orientada a objetos',
      advisor: 'Carlos Ramírez',
      modality: 'Presencial'
    },
    {
      id: 3,
      date: '2025-11-28',
      time: '09:00',
      subject: 'Inglés B2',
      advisor: 'María Gómez',
      modality: 'En línea'
    }
  ];

  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth(); // 0-11
  selectedDateKey: string = this.buildDateKey(this.currentDate);
  selectedDaySessions: Session[] = [];

  /** Avisos locales */
  notices: Notice[] = [
    {
      id: '1',
      title: 'Nueva solicitud aceptada',
      text: 'Un asesor aceptó tu solicitud de asesoría. Revisa tu bandeja de sesiones.'
    },
    {
      id: '2',
      title: 'Recordatorio de sesión',
      text: 'Mañana tienes una sesión de Cálculo diferencial a las 10:00.'
    },
    {
      id: '3',
      title: 'Actualización en Agora',
      text: 'Hemos mejorado el sistema de notificaciones para que no te pierdas nada.'
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

  /* =========================
     CICLO DE VIDA
     ========================= */

  ngOnInit(): void {
    this.loadMyProfile().subscribe(() => {
      // nada extra por ahora
    });

    // Cargar asesores una vez y luego filtrar localmente
    this.loadInitialAdvisers();

    // Reaccionar a cambios del formulario para filtrar local
    this.filtros.valueChanges
      .pipe(
        startWith(this.filtros.value),
        debounceTime(200),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Inicializar calendario
    this.buildCalendar();
    this.updateSelectedDaySessions();
  }

  /* =========================
     PERFIL ACTUAL
     ========================= */

  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;

        // Ejemplo simple: si tiene foto y al menos una especialidad,
        // consideramos el perfil más completo
        if (this.topAvatarUrl && profile?.specialties?.length) {
          this.profileCompletion = 100;
        }
      }),
      catchError(err => {
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

  onEditProfile(): void {
    this.router.navigate(['/complete-profile']);
  }

  /* =========================
     DATA DE ASESORES
     ========================= */

  private loadInitialAdvisers(): void {
    this.fetchAdvisers()
      .pipe(
        catchError(() => {
          // Si falla la API, usamos mocks
          return of(this.buildMockAdvisers());
        })
      )
      .subscribe(data => {
        this.allAdvisers = data && data.length ? data : this.buildMockAdvisers();
        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  /** Llamada a la API (sin filtros, filtramos localmente) */
  private fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    // Conservamos la posibilidad de mandar filtros si en el futuro se requieren
    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http
      .get<AdviserCardResponse[]>(this.advisersApiUrl, { params })
      .pipe(
        map(response => response.map(a => this.mapApiToView(a))),
        tap(() => {
          this.isLoadingAdvisers = false;
        }),
        catchError(err => {
          console.error('Error al obtener asesores', err);
          this.isLoadingAdvisers = false;
          return of<AdviserCardView[]>([]);
        })
      );
  }

  /** Mapea el modelo de la API al modelo de la tarjeta de la UI */
  private mapApiToView(adviser: AdviserCardResponse): AdviserCardView {
    const subject =
      adviser.specialties && adviser.specialties.length
        ? adviser.specialties[0]
        : null;

    return {
      id: adviser.userId,
      name: `${adviser.firstName} ${adviser.lastName}`,
      avatarUrl: adviser.photoUrl,
      nivel: adviser.level,
      tags: adviser.specialties,
      description: adviser.description,
      bookmarked: false,
      subject,
      location: null // cuando el backend tenga stateCode, se puede mapear aquí
    };
  }

  /** Datos mock locales, por si la API no está disponible */
  private buildMockAdvisers(): AdviserCardView[] {
    return [
      {
        id: 1,
        name: 'Ana López',
        avatarUrl: null,
        nivel: 'Universidad',
        tags: ['Cálculo', 'Álgebra'],
        description: 'Apoyo en matemáticas para primeros semestres.',
        bookmarked: false,
        subject: 'Matemáticas',
        location: 'CHIS'
      },
      {
        id: 2,
        name: 'Carlos Ramírez',
        avatarUrl: null,
        nivel: 'Universidad',
        tags: ['POO', 'Java'],
        description: 'Asesorías en programación orientada a objetos.',
        bookmarked: false,
        subject: 'Programación',
        location: 'CDMX'
      },
      {
        id: 3,
        name: 'María Gómez',
        avatarUrl: null,
        nivel: 'Bachillerato',
        tags: ['Inglés', 'TOEFL'],
        description: 'Preparación para exámenes de certificación en inglés.',
        bookmarked: false,
        subject: 'Idiomas',
        location: 'JAL'
      }
    ];
  }

  /** Aplica búsqueda y filtros sobre allAdvisers */
  private applyFilters(): void {
    const { search, lugar, nivel, materia } = this.filtros.value;
    const searchTerm = (search || '').toLowerCase().trim();

    this.advisers = this.allAdvisers.filter(adviser => {
      // Búsqueda por nombre, descripción y tags
      let matchesSearch = true;
      if (searchTerm) {
        const haystack = [
          adviser.name || '',
          adviser.description || '',
          adviser.subject || '',
          (adviser.tags || []).join(' ')
        ]
          .join(' ')
          .toLowerCase();

        matchesSearch = haystack.includes(searchTerm);
      }

      // Filtro por lugar
      let matchesLugar = true;
      if (lugar && adviser.location) {
        matchesLugar = adviser.location === lugar;
      }

      // Filtro por nivel
      let matchesNivel = true;
      if (nivel && adviser.nivel) {
        matchesNivel = adviser.nivel === nivel;
      }

      // Filtro por materia (en este ejemplo, buscamos en tags)
      let matchesMateria = true;
      if (materia && adviser.tags && adviser.tags.length) {
        const materiaStr = String(materia).toLowerCase();
        matchesMateria = adviser.tags.some(tag =>
          tag.toLowerCase().includes(materiaStr)
        );
      }

      return matchesSearch && matchesLugar && matchesNivel && matchesMateria;
    });
  }

  /* =========================
     MANEJO DE FILTROS (UI)
     ========================= */

  onSearchChange(): void {
    this.applyFilters();
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.filtros.patchValue({ search: '' }, { emitEvent: true });
  }

  clearFilters(): void {
    this.filtros.setValue(
      {
        search: '',
        lugar: '',
        nivel: '',
        materia: ''
      },
      { emitEvent: true }
    );
  }

  /* =========================
     CALENDARIO / AGENDA
     ========================= */

  private buildDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildCalendar(): void {
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();
    const todayKey = this.buildDateKey(this.currentDate);

    const days: CalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateKey = this.buildDateKey(date);
      const hasSessions = this.upcomingSessions.some(
        s => s.date === dateKey
      );

      days.push({
        date,
        dateKey,
        dayNumber: day,
        isToday: dateKey === todayKey,
        hasSessions
      });
    }

    this.calendarDays = days;
  }

  private updateSelectedDaySessions(): void {
    this.selectedDaySessions = this.upcomingSessions
      .filter(s => s.date === this.selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  get currentMonthLabel(): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    return `${months[this.currentMonth]} ${this.currentYear}`;
  }

  get selectedDateLabel(): string {
    const [year, month, day] = this.selectedDateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    });
  }

  onSelectDate(day: CalendarDay): void {
    this.selectedDateKey = day.dateKey;
    this.updateSelectedDaySessions();
  }

  goToPreviousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.buildCalendar();
    this.updateSelectedDaySessions();
  }

  goToNextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.buildCalendar();
    this.updateSelectedDaySessions();
  }

  /* =========================
     AVISOS
     ========================= */

  onViewNotice(noticeId: string): void {
    console.log('Ver aviso', noticeId);
    // En el futuro se puede navegar a un detalle
  }

  onViewAllNotices(): void {
    console.log('Ver todos los avisos');
  }

  /* =========================
     SIDEBAR / NAVEGACIÓN
     ========================= */

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  onNavigate(section: string): void {
    this.activeSection = section;
    if (this.isMobileSidebarOpen) {
      this.closeMobileSidebar();
    }
    console.log('Navegar a sección', section);
  }

  /* =========================
     HELPERS GENERALES
     ========================= */

  trackByStr(_: number, value: string): string {
    return value;
  }

  trackById(_: number, item: AdviserCardView): number {
    return item.id;
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
    // this.router.navigate(['/asesor', adviser.id]);
  }
}





