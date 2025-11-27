import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
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
import {Observable, of} from 'rxjs';

import {
  AdviserDetailModal,
  AdviserDetail,
  Review
} from '../../shared/components/adviser-detail-modal/adviser-detail-modal';

import {
  NotificationsModal,
  Notification,
  NotificationType,
  NotificationStatusFilter
} from '../../shared/components/notifications-modal/notifications-modal';

import {AdviserService, AdviserCardResponse} from '../../core/services/adviser.service';
import {ProfileService} from '../../core/services/profile.service';
import {ClassService, StudentClassResponse} from '../../core/services/class.service';
import {
  NotificationService,
  NotificationDto
} from '../../core/services/notification.service';

/* Modelo para la tarjeta del asesor en la UI */
interface AdviserCardView {
  id: number;
  name: string;
  avatarUrl: string | null;
  nivel: string | null;
  tags: string[];
  description: string | null;
  bookmarked: boolean;
  subject?: string | null;
  location?: string | null;
}

/* Sesiones de agenda (datos reales de backend, transformados) */
interface Session {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm o placeholder
  subject: string;
  advisor: string;
  modality?: 'En línea' | 'Presencial';
}

/* Día del calendario */
interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isToday: boolean;
  hasSessions: boolean;
}

/* Avisos locales (para no romper el HTML de avisos) */
interface Notice {
  id: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AdviserDetailModal, NotificationsModal],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit {

  /* Estado general de UI */
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;

  /* Estado del menú lateral */
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  activeSection = 'inicio';

  /* Catálogos y filtros (de momento estáticos) */
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: { id: number; name: string }[] = [
    {id: 1, name: 'Ciencias Naturales'},
    {id: 2, name: 'Idiomas'},
    {id: 3, name: 'Artes'}
  ];

  filtros: FormGroup;

  /* Datos de asesores */
  allAdvisers: AdviserCardView[] = [];
  advisers: AdviserCardView[] = [];

  /* Modal de detalle del asesor */
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  /* Notificaciones (modal) */
  isNotificationsModalOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  currentNotificationFilter: NotificationStatusFilter = 'pending';

  /* Agenda y calendario (basados en clases reales del backend) */
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  upcomingSessions: Session[] = [];

  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  selectedDateKey: string = this.buildDateKey(this.currentDate);
  selectedDaySessions: Session[] = [];

  /* Avisos (para la tarjeta de avisos del HTML) */
  notices: Notice[] = [
    {
      id: '1',
      title: 'Nueva solicitud aceptada',
      text: 'Un asesor aceptó tu solicitud de asesoría. Revisa tus sesiones agendadas.'
    },
    {
      id: '2',
      title: 'Recordatorio de sesión',
      text: 'Mañana tienes una sesión de Cálculo diferencial a las 10:00.'
    },
    {
      id: '3',
      title: 'Actualización en Agora',
      text: 'Se actualizó el sistema de notificaciones para mejorar los recordatorios.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private adviserService: AdviserService,
    private profileService: ProfileService,
    private classService: ClassService,
    private notificationService: NotificationService
  ) {
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  /* Ciclo de vida */

  ngOnInit(): void {
    // Perfil
    this.loadMyProfile().subscribe();

    // Notificaciones (iniciamos en 'pending')
    this.loadNotificationsFromBackend('pending');

    // Asesores
    this.loadInitialAdvisers();

    // Sesiones (clases donde el alumno está inscrito)
    this.loadSessionsFromBackend();

    // Reaplicar filtros cuando cambie el formulario
    this.filtros.valueChanges
      .pipe(
        startWith(this.filtros.value),
        debounceTime(200),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Calendario base (aunque luego se recalcula con sesiones)
    this.buildCalendar();
    this.updateSelectedDaySessions();
  }

  /* Perfil */

  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.profileService.getMyProfile().pipe(
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
      tap(() => {
        this.isLoadingProfile = false;
      }),
      map(() => void 0)
    );
  }

  onEditProfile(): void {
    this.router.navigate(['/complete-profile']);
  }

  /* Datos de asesores */

  private loadInitialAdvisers(): void {
    this.fetchAdvisers().subscribe(data => {
      this.allAdvisers = data && data.length ? data : [];
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  private fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    this.isLoadingAdvisers = true;

    return this.adviserService.getAdvisers(filters).pipe(
      map((response: AdviserCardResponse[]) => response.map(a => this.mapApiToView(a))),
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
      location: adviser.stateCode ?? null
    } as AdviserCardView;
  }

  private applyFilters(): void {
    const {search, lugar, nivel, materia} = this.filtros.value;
    const searchTerm = (search || '').toLowerCase().trim();

    this.advisers = this.allAdvisers.filter(adviser => {
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

      let matchesLugar = true;
      if (lugar) {
        matchesLugar = adviser.location === lugar;
      }

      let matchesNivel = true;
      if (nivel && adviser.nivel) {
        matchesNivel = adviser.nivel === nivel;
      }

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

  onSearchChange(): void {
    this.applyFilters();
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.filtros.patchValue({search: ''}, {emitEvent: true});
  }

  clearFilters(): void {
    this.filtros.setValue(
      {
        search: '',
        lugar: '',
        nivel: '',
        materia: ''
      },
      {emitEvent: true}
    );
  }

  /* Calendario y agenda */

  private buildDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadSessionsFromBackend(): void {
    this.classService.getMyEnrolledClasses().subscribe({
      next: (classes: StudentClassResponse[]) => {
        this.upcomingSessions = classes.map(c => ({
          id: c.classId,
          date: c.classDate,
          time: 'Sin horario',
          subject: c.title,
          advisor: `Tutor #${c.tutorId}`,
          modality: undefined
        }));

        this.buildCalendar();
        this.updateSelectedDaySessions();
      },
      error: () => {
        this.buildCalendar();
        this.updateSelectedDaySessions();
      }
    });
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

  /* Sidebar y navegación */

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
  }

  onNavigateToPerfil(): void {
    this.activeSection = 'perfil';
    if (this.isMobileSidebarOpen) {
      this.closeMobileSidebar();
    }
    this.router.navigate(['/complete-profile']);
  }

  /* Utilidades */

  trackByStr(_: number, value: string): string {
    return value;
  }

  trackById(_: number, item: AdviserCardView): number {
    return item.id;
  }

  toggleNotificationsPanel(): void {
    console.log('toggleNotificationsPanel, valor antes:', this.isNotificationsModalOpen);
    this.isNotificationsModalOpen = !this.isNotificationsModalOpen;
    console.log('valor después:', this.isNotificationsModalOpen);
  }

  toggleBookmark(adviser: AdviserCardView): void {
    adviser.bookmarked = !adviser.bookmarked;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onSeeMore(adviser: AdviserCardView): void {
    this.openAdviserDetail(adviser);
  }

  /* Modal de detalle del asesor */
  openAdviserDetail(adviser: AdviserCardView): void {
    const mockReviews: Review[] = [
      {
        userPhoto: null,
        userName: 'Juan Pérez',
        text: 'Excelente asesor, muy paciente y explica muy bien los conceptos.',
        rating: 5
      },
      {
        userPhoto: null,
        userName: 'Laura García',
        text: 'Me ayudó mucho con mis dudas, totalmente recomendado.',
        rating: 5
      },
      {
        userPhoto: null,
        userName: 'Pedro Sánchez',
        text: 'Buena experiencia, aprendí mucho en las sesiones.',
        rating: 4
      }
    ];

    this.selectedAdviser = {
      ...adviser,
      rating: 4.5,
      reviews: mockReviews
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAdviser = null;
  }

  onWriteMessage(adviserId: number): void {
    console.log('Escribir mensaje al asesor:', adviserId);
    this.closeModal();
  }

  /* Métodos de notificaciones */

  closeNotifications(): void {
    this.isNotificationsModalOpen = false;
  }

  onAcceptRequest(notificationId: number): void {
    this.notificationService.acceptRequest(notificationId).subscribe({
      next: (res) => {
        console.log('Solicitud aceptada, respuesta backend:', res);
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.unreadCount = this.notifications.length;
      },
      error: (err) => {
        console.error('Error al aceptar solicitud', err);
      }
    });
  }

  onRejectRequest(notificationId: number): void {
    this.notificationService.declineRequest(notificationId).subscribe({
      next: (res) => {
        console.log('Solicitud rechazada, respuesta backend:', res);
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.unreadCount = this.notifications.length;
      },
      error: (err) => {
        console.error('Error al rechazar solicitud', err);
      }
    });
  }

  private mapDtoToNotification(dto: NotificationDto): Notification {
    let type: NotificationType;

    switch (dto.notificationTypeName) {
      case 'contact_request':
        type = NotificationType.REQUEST;
        break;

      case 'class_enrollment_request':
      case 'class_enrollment_approved':
      case 'class_enrollment_declined':
        type = NotificationType.CLASS;
        break;

      default:
        type = NotificationType.CLASS;
        break;
    }

    const fullName =
      `${dto.senderFirstName ?? ''} ${dto.senderLastName ?? ''}`.trim() || 'Usuario';

    return {
      id: dto.notificationId,
      type,
      userPhoto: dto.senderPhotoUrl ?? null,
      userName: fullName,
      classDate: dto.classDate ?? undefined,
      classTime: undefined,
      timestamp: new Date(dto.createdAt),
      status: dto.status
    } as Notification;
  }

  private loadNotificationsFromBackend(
    status: NotificationStatusFilter = 'pending'
  ): void {
    const statusParam = status === 'all' ? undefined : status;

    this.notificationService.getMyNotifications(statusParam).subscribe({
      next: (dtos: NotificationDto[]) => {
        console.log('Notificaciones desde backend:', dtos);
        this.notifications = dtos.map(dto => this.mapDtoToNotification(dto));
        this.unreadCount = this.notifications.length;
      },
      error: (err) => {
        console.error('Error al cargar notificaciones', err);
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  onNotificationFilterChange(filter: NotificationStatusFilter): void {
    this.currentNotificationFilter = filter;
    this.loadNotificationsFromBackend(filter);
  }

  /* Avisos (handlers simples para no romper el HTML) */

  onViewNotice(id: string): void {
    console.log('Ver aviso', id);
  }

  onViewAllNotices(): void {
    console.log('Ver todos los avisos');
  }
}
