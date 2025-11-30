import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subject, of} from 'rxjs';
import {takeUntil, switchMap, tap, catchError} from 'rxjs/operators';

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
import {LucideAngularModule} from 'lucide-angular';

/* Interfaces Locales */
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

interface Notice {
  id: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [
    CommonModule,
    NotificationsModal,
    AdvisorListComponent,
    StudentChatsComponent,
    LucideAngularModule
  ],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit, OnDestroy {

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

  /* Avisos */
  notices: Notice[] = [
    {id: '1', title: 'Nueva solicitud aceptada', text: 'Un asesor aceptó tu solicitud.'},
    {id: '2', title: 'Recordatorio', text: 'Mañana tienes sesión.'}
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService,
    private classService: ClassService,
    private notificationService: NotificationService
  ) {
    this.selectedDateKey = this.buildDateKey(this.currentDate);
  }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) this.userName = JSON.parse(userStr).firstName ?? this.userName;

    this.loadMyProfile();
    this.loadSessionsFromBackend();
    this.setupNotificationsStream();
    this.onNotificationFilterChange('all');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  /* --- MÉTODOS DE NAVEGACIÓN --- */
  setView(view: 'home' | 'chats' | 'favoritos'): void {
    this.currentView = view;
  }

  onNavigate(section: string): void {
    console.log('Navegando a sección:', section);
    this.isMobileSidebarOpen = false;
  }

  onEditProfile(): void {
    this.router.navigate(['/complete-profile']);
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

  /* --- MÉTODOS DE CALENDARIO --- */
  private buildDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadSessionsFromBackend(): void {
    this.classService.getMyEnrolledClasses().subscribe({
      next: (classes) => {
        this.upcomingSessions = classes.map(c => ({
          id: c.classId,
          date: c.classDate, // Asegúrate que el backend mande YYYY-MM-DD
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

  /* --- MÉTODOS DE NOTIFICACIONES --- */
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
      tap(() => this.isLoadingNotifications = true),
      switchMap(filter => {
        const status = filter === 'all' ? undefined : filter;
        return this.notificationService.getMyNotifications(status).pipe(catchError(() => of([])));
      }),
      takeUntil(this.destroy$)
    ).subscribe(dtos => {
      // Mapeo básico
      this.notifications = dtos.map(d => ({
        id: d.notificationId,
        type: NotificationType.CLASS, // Ajusta según tu lógica real
        userPhoto: d.senderPhotoUrl || null,
        userName: `${d.senderFirstName} ${d.senderLastName}`,
        timestamp: new Date(d.createdAt),
        status: d.status
      }));
      this.unreadCount = this.notifications.length;
      this.isLoadingNotifications = false;
    });
  }

  onAcceptRequest(id: number) {
    this.notificationService.acceptRequest(id).subscribe(() => this.onNotificationFilterChange('all'));
  }

  onRejectRequest(id: number) {
    this.notificationService.declineRequest(id).subscribe(() => this.onNotificationFilterChange('all'));
  }
}
