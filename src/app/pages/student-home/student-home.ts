import {Component, OnInit, OnDestroy, ChangeDetectorRef, inject} from '@angular/core'; // inject añadido
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Subject, of} from 'rxjs';
import {takeUntil, switchMap, tap, catchError} from 'rxjs/operators';
import {LucideAngularModule} from 'lucide-angular';

// Componentes Hijos
import {AdvisorListComponent} from './components/advisor-list/advisor-list.component';
import {StudentChatsComponent} from './components/student-chats/student-chats.component';

// Modales y Servicios
import {
  NotificationsModal,
  Notification,
  NotificationType,
  NotificationStatusFilter
} from '../../shared/components/notifications-modal/notifications-modal';
import {ProfileService} from '../../core/services/profile.service';
import {ClassService} from '../../core/services/class.service';
import {NotificationService, NotificationDto} from '../../core/services/notification.service';
import {AdviserService, Specialty} from '../../core/services/adviser.service'; // Importar AdviserService y Specialty

// Interfaces auxiliares para catálogos
interface Opcion {
  value: string;
  label: string;
}

// Interfaces Locales (Calendario)
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
    LucideAngularModule
  ],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit, OnDestroy {
  // Servicios inyectados
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private profileService = inject(ProfileService);
  private classService = inject(ClassService);
  private notificationService = inject(NotificationService);
  private adviserService = inject(AdviserService); // Inyectamos AdviserService para las materias

  /* --- 1. VARIABLES PARA FILTROS (Vinculadas al HTML) --- */
  searchTerm: string = '';
  filterLugar: string = '';
  filterNivel: string = '';
  filterMateria: string = '';

  /* --- 2. CATÁLOGOS REALES --- */
  estadosMx: Opcion[] = [
    {value: 'AGS', label: 'Aguascalientes'}, {value: 'BC', label: 'Baja California'},
    {value: 'BCS', label: 'Baja California Sur'}, {value: 'CAMP', label: 'Campeche'},
    {value: 'CHIS', label: 'Chiapas'}, {value: 'CHIH', label: 'Chihuahua'},
    {value: 'CDMX', label: 'Ciudad de México'}, {value: 'COAH', label: 'Coahuila'},
    {value: 'COL', label: 'Colima'}, {value: 'DGO', label: 'Durango'},
    {value: 'GTO', label: 'Guanajuato'}, {value: 'GRO', label: 'Guerrero'},
    {value: 'HGO', label: 'Hidalgo'}, {value: 'JAL', label: 'Jalisco'},
    {value: 'MEX', label: 'Estado de México'}, {value: 'MICH', label: 'Michoacán'},
    {value: 'MOR', label: 'Morelos'}, {value: 'NAY', label: 'Nayarit'},
    {value: 'NL', label: 'Nuevo León'}, {value: 'OAX', label: 'Oaxaca'},
    {value: 'PUE', label: 'Puebla'}, {value: 'QRO', label: 'Querétaro'},
    {value: 'QROO', label: 'Quintana Roo'}, {value: 'SLP', label: 'San Luis Potosí'},
    {value: 'SIN', label: 'Sinaloa'}, {value: 'SON', label: 'Sonora'},
    {value: 'TAB', label: 'Tabasco'}, {value: 'TAM', label: 'Tamaulipas'},
    {value: 'TLAX', label: 'Tlaxcala'}, {value: 'VER', label: 'Veracruz'},
    {value: 'YUC', label: 'Yucatán'}, {value: 'ZAC', label: 'Zacatecas'},
  ];

  niveles: Opcion[] = [
    {value: 'Primaria', label: 'Primaria'},
    {value: 'Secundaria', label: 'Secundaria'},
    {value: 'Preparatoria', label: 'Preparatoria'},
    {value: 'Universidad', label: 'Universidad'},
    {value: 'Licenciatura', label: 'Licenciatura'},
    {value: 'Maestría', label: 'Maestría'},
    {value: 'Doctorado', label: 'Doctorado'},
    {value: 'Técnico', label: 'Técnico'},
    {value: 'Diplomado', label: 'Diplomado'},
    {value: 'Curso', label: 'Curso'},
    {value: 'Taller', label: 'Taller'},
    {value: 'Seminario', label: 'Seminario'},
    {value: 'Otro', label: 'Otro'},
  ];

  tagsDisponibles: Specialty[] = []; // Se llenará desde la DB

  /* Estado general */
  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;

  /* Navegación */
  currentView: 'home' | 'chats' | 'favoritos' = 'home';
  userName = 'Estudiante';

  /* Notificaciones */
  isNotificationsModalOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoadingNotifications = false;
  currentNotificationFilter: NotificationStatusFilter = 'all';
  private notificationFilter$ = new Subject<NotificationStatusFilter>();
  private destroy$ = new Subject<void>();

  /* Calendario / Agenda */
  upcomingSessions: Session[] = [];
  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  selectedDateKey: string = '';
  selectedDaySessions: Session[] = [];
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  constructor() {
    this.selectedDateKey = this.buildDateKey(this.currentDate);
  }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) this.userName = JSON.parse(userStr).firstName ?? this.userName;

    this.loadMyProfile();
    this.loadSessionsFromBackend();
    this.loadSpecialties(); // <--- CARGAMOS LAS MATERIAS REALES
    this.setupNotificationsStream();
    this.onNotificationFilterChange('all');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Carga de Especialidades (Materias) ---
  private loadSpecialties() {
    this.adviserService.getSpecialties().subscribe({
      next: (data) => this.tagsDisponibles = data,
      error: (err) => console.error('Error cargando materias', err)
    });
  }

  // --- Perfil ---
  private loadMyProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getMyProfile().subscribe({
      next: (p) => {
        this.topAvatarUrl = p?.photoUrl ?? null;
        this.isLoadingProfile = false;
      },
      error: () => this.isLoadingProfile = false
    });
  }

  // --- Navegación ---
  setView(view: 'home' | 'chats' | 'favoritos'): void {
    this.currentView = view;
  }

  onNavigate(section: string): void {
    console.log('Nav:', section);
    this.isMobileSidebarOpen = false;
  }

  onEditProfile(): void {
    this.router.navigate(['/complete-profile'], {
      queryParams: {redirectTo: 'student'}
    });
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // --- Calendario ---
  private buildDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadSessionsFromBackend(): void {
    this.classService.getMyEnrolledClasses().subscribe({
      next: (classes) => {
        this.upcomingSessions = classes.map(c => ({
          id: c.classId,
          date: c.classDate,
          time: 'Sin horario',
          subject: c.title,
          advisor: `Tutor #${c.tutorId}`
        }));
        this.buildCalendar();
        this.updateSelectedDaySessions();
      }
    });
  }

  private buildCalendar(): void {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const todayKey = this.buildDateKey(new Date());
    const days: CalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateKey = this.buildDateKey(date);
      days.push({
        date, dateKey, dayNumber: day,
        isToday: dateKey === todayKey,
        hasSessions: this.upcomingSessions.some(s => s.date === dateKey)
      });
    }
    this.calendarDays = days;
  }

  private updateSelectedDaySessions(): void {
    this.selectedDaySessions = this.upcomingSessions.filter(s => s.date === this.selectedDateKey);
  }

  onSelectDate(day: CalendarDay): void {
    this.selectedDateKey = day.dateKey;
    this.updateSelectedDaySessions();
  }

  get currentMonthLabel(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[this.currentMonth]} ${this.currentYear}`;
  }

  get selectedDateLabel(): string {
    const [year, month, day] = this.selectedDateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'});
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

  // --- Notificaciones ---
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
    this.notificationFilter$.pipe(
      tap(() => setTimeout(() => {
        this.isLoadingNotifications = true;
        this.notifications = [];
        this.unreadCount = 0;
      })),
      switchMap(filter => {
        const status = filter === 'all' ? undefined : filter;
        return this.notificationService.getMyNotifications(status).pipe(catchError(() => of([])));
      }),
      takeUntil(this.destroy$)
    ).subscribe(dtos => {
      setTimeout(() => {
        this.notifications = dtos.map(d => ({
          id: d.notificationId,
          type: NotificationType.CLASS,
          userPhoto: d.senderPhotoUrl || null,
          userName: `${d.senderFirstName} ${d.senderLastName}`,
          timestamp: new Date(d.createdAt),
          status: d.status
        }));
        this.unreadCount = this.notifications.length;
        this.isLoadingNotifications = false;
      });
    });
  }

  onAcceptRequest(id: number) {
    this.notificationService.acceptRequest(id).subscribe(() => this.onNotificationFilterChange('all'));
  }

  onRejectRequest(id: number) {
    this.notificationService.declineRequest(id).subscribe(() => this.onNotificationFilterChange('all'));
  }
}
