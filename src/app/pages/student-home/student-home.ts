import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap, catchError } from 'rxjs/operators';

// Lucide Icons
import {
  LucideAngularModule,
  Menu,
  Home,
  MessagesSquare,
  Star,
  GraduationCap,
  Bell,
  Search
} from 'lucide-angular';

// Componentes hijos
import {
  AdvisorListComponent,
  AdviserCardView
} from './components/advisor-list/advisor-list.component';
import { StudentChatsComponent } from './components/student-chats/student-chats.component';
import { StudentReviewsComponent } from './components/student-reviews/student-reviews.component';
import { StudentFavoritesComponent } from './components/student-favorites/student-favorites.component';

// Modales y servicios
import {
  NotificationsModal,
  Notification,
  NotificationType,
  NotificationStatusFilter
} from '../../shared/components/notifications-modal/notifications-modal';
import { ProfileService } from '../../core/services/profile.service';
import { ClassService } from '../../core/services/class.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AdviserService,
  Specialty,
  AdviserCardResponse
} from '../../core/services/adviser.service';

// Interfaces auxiliares
interface Opcion {
  value: string;
  label: string;
}

interface Session {
  id: number;
  date: string;
  time: string;
  subject: string;
  advisor: string;
  modality?: 'En línea' | 'Presencial';
}

interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isToday: boolean;
  hasSessions: boolean;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationsModal,
    AdvisorListComponent,
    StudentChatsComponent,
    LucideAngularModule,
    StudentReviewsComponent,
    StudentFavoritesComponent
  ],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit, OnDestroy {
  // Servicios
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private profileService = inject(ProfileService);
  private classService = inject(ClassService);
  private notificationService = inject(NotificationService);
  private adviserService = inject(AdviserService);

  // Íconos Lucide expuestos al HTML
  
  public MenuIcon = Menu;
  public HomeIcon = Home;
  public MessagesSquareIcon = MessagesSquare;
  public StarIcon = Star;
  public GraduationCapIcon = GraduationCap;
  public BellIcon = Bell;
  public SearchIcon = Search;

  // Filtros
  searchTerm = '';
  filterLugar = '';
  filterNivel = '';
  filterMateria = '';

  estadosMx: Opcion[] = [
    { value: 'AGS', label: 'Aguascalientes' },
    { value: 'BC', label: 'Baja California' },
    { value: 'BCS', label: 'Baja California Sur' },
    { value: 'CAMP', label: 'Campeche' },
    { value: 'CHIS', label: 'Chiapas' },
    { value: 'CHIH', label: 'Chihuahua' },
    { value: 'CDMX', label: 'Ciudad de México' },
    { value: 'COAH', label: 'Coahuila' },
    { value: 'COL', label: 'Colima' },
    { value: 'DGO', label: 'Durango' },
    { value: 'GTO', label: 'Guanajuato' },
    { value: 'GRO', label: 'Guerrero' },
    { value: 'HGO', label: 'Hidalgo' },
    { value: 'JAL', label: 'Jalisco' },
    { value: 'MEX', label: 'Estado de México' },
    { value: 'MICH', label: 'Michoacán' },
    { value: 'MOR', label: 'Morelos' },
    { value: 'NAY', label: 'Nayarit' },
    { value: 'NL', label: 'Nuevo León' },
    { value: 'OAX', label: 'Oaxaca' },
    { value: 'PUE', label: 'Puebla' },
    { value: 'QRO', label: 'Querétaro' },
    { value: 'QROO', label: 'Quintana Roo' },
    { value: 'SLP', label: 'San Luis Potosí' },
    { value: 'SIN', label: 'Sinaloa' },
    { value: 'SON', label: 'Sonora' },
    { value: 'TAB', label: 'Tabasco' },
    { value: 'TAM', label: 'Tamaulipas' },
    { value: 'TLAX', label: 'Tlaxcala' },
    { value: 'VER', label: 'Veracruz' },
    { value: 'YUC', label: 'Yucatán' },
    { value: 'ZAC', label: 'Zacatecas' }
  ];

  niveles: Opcion[] = [
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Secundaria', label: 'Secundaria' },
    { value: 'Preparatoria', label: 'Preparatoria' },
    { value: 'Universidad', label: 'Universidad' },
    { value: 'Licenciatura', label: 'Licenciatura' },
    { value: 'Maestría', label: 'Maestría' },
    { value: 'Doctorado', label: 'Doctorado' },
    { value: 'Técnico', label: 'Técnico' },
    { value: 'Diplomado', label: 'Diplomado' },
    { value: 'Curso', label: 'Curso' },
    { value: 'Taller', label: 'Taller' },
    { value: 'Seminario', label: 'Seminario' },
    { value: 'Otro', label: 'Otro' }
  ];

  tagsDisponibles: Specialty[] = [];

  // Asesores
  isLoadingAdvisers = false;
  advisers: AdviserCardView[] = [];

  // UI general
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;

  currentView: 'home' | 'chats' | 'favoritos' | 'reviews' = 'home';
  userName = 'Estudiante';

  // Notificaciones
  isNotificationsModalOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoadingNotifications = false;

  currentNotificationFilter: NotificationStatusFilter = 'all';
  private notificationFilter$ = new Subject<NotificationStatusFilter>();
  private destroy$ = new Subject<void>();

  // Calendario
  upcomingSessions: Session[] = [];
  calendarDays: CalendarDay[] = [];
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  selectedDateKey = '';
  selectedDaySessions: Session[] = [];
  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  constructor() {
    this.selectedDateKey = this.buildDateKey(this.currentDate);
  }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) this.userName = JSON.parse(userStr).firstName ?? this.userName;

    this.loadMyProfile();
    this.loadSessionsFromBackend();
    this.loadSpecialties();
    this.setupNotificationsStream();
    this.onNotificationFilterChange('all');
    this.loadAdvisersFromBackend();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------- Perfil ----------
  private loadMyProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getMyProfile().subscribe({
      next: (p) => {
        this.topAvatarUrl = p?.photoUrl ?? null;
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Navegación ----------
  setView(view: 'home' | 'chats' | 'favoritos' | 'reviews') {
    this.currentView = view;
  }

  onNavigate(section: string): void {
    // Por ahora solo cerramos sidebar móvil y dejamos rastro en consola
    console.log('Navigate to =>', section);
    this.isMobileSidebarOpen = false;
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  onEditProfile() {
    this.router.navigate(['/complete-profile'], {
      queryParams: { redirectTo: 'student' }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // ---------- Calendario ----------
  private buildDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadSessionsFromBackend(): void {
    this.classService.getMyEnrolledClasses().subscribe({
      next: (classes) => {
        this.upcomingSessions = classes.map((c) => ({
          id: c.classId,
          date: c.classDate,
          time: 'Sin horario',
          subject: c.title,
          advisor: `Tutor #${c.tutorId}`
        }));

        this.buildCalendar();
        this.updateSelectedDaySessions();
        this.cdr.detectChanges();
      }
    });
  }

  private buildCalendar(): void {
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();
    const todayKey = this.buildDateKey(new Date());
    const days: CalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateKey = this.buildDateKey(date);

      days.push({
        date,
        dateKey,
        dayNumber: day,
        isToday: dateKey === todayKey,
        hasSessions: this.upcomingSessions.some((s) => s.date === dateKey)
      });
    }

    this.calendarDays = days;
  }

  private updateSelectedDaySessions(): void {
    this.selectedDaySessions = this.upcomingSessions.filter(
      (s) => s.date === this.selectedDateKey
    );
  }

  onSelectDate(day: CalendarDay): void {
    this.selectedDateKey = day.dateKey;
    this.updateSelectedDaySessions();
  }

  goToPreviousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar();
  }

  goToNextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar();
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
    if (!this.selectedDateKey) return '';
    const [year, month, day] = this.selectedDateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    });
  }

  // ---------- Notificaciones ----------
  toggleNotificationsPanel(): void {
    this.isNotificationsModalOpen = !this.isNotificationsModalOpen;
  }

  closeNotifications(): void {
    this.isNotificationsModalOpen = false;
  }

  onNotificationFilterChange(filter: NotificationStatusFilter): void {
    this.currentNotificationFilter = filter;
    this.notificationFilter$.next(filter);
  }

  private setupNotificationsStream(): void {
    this.notificationFilter$
      .pipe(
        tap(() => {
          this.isLoadingNotifications = true;
          this.notifications = [];
          this.unreadCount = 0;
          this.cdr.detectChanges();
        }),
        switchMap((filter) => {
          const status = filter === 'all' ? undefined : filter;
          return this.notificationService
            .getMyNotifications(status)
            .pipe(catchError(() => of([])));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((dtos) => {
        this.notifications = dtos.map((d) => ({
          id: d.notificationId,
          type: NotificationType.CLASS,
          userPhoto: d.senderPhotoUrl || null,
          userName: `${d.senderFirstName} ${d.senderLastName}`,
          timestamp: new Date(d.createdAt),
          status: d.status
        }));

        this.unreadCount = this.notifications.length;
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      });
  }

  onAcceptRequest(id: number): void {
    this.notificationService
      .acceptRequest(id)
      .subscribe(() => this.onNotificationFilterChange('all'));
  }

  onRejectRequest(id: number): void {
    this.notificationService
      .declineRequest(id)
      .subscribe(() => this.onNotificationFilterChange('all'));
  }

  // ---------- Asesores ----------
  onFiltersChange(): void {
    this.loadAdvisersFromBackend();
  }

  private loadAdvisersFromBackend(): void {
    this.isLoadingAdvisers = true;

    this.adviserService
      .getAdvisers({
        search: this.searchTerm,
        lugar: this.filterLugar,
        nivel: this.filterNivel,
        materia: this.filterMateria
      })
      .subscribe({
        next: (response: AdviserCardResponse[]) => {
          this.advisers = response.map((a) => this.mapApiToView(a));
          this.isLoadingAdvisers = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando asesores', err);
          this.advisers = [];
          this.isLoadingAdvisers = false;
          this.cdr.detectChanges();
        }
      });
  }

  private loadSpecialties(): void {
    this.adviserService.getSpecialties().subscribe({
      next: (data) => {
        this.tagsDisponibles = data;
        this.cdr.detectChanges();
      },
      error: () => console.error('Error cargando materias')
    });
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
    };
  }
}
