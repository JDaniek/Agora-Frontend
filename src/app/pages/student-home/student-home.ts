import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

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

interface NotificationItem {
  title: string;
  body: string;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit {

  private advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';

  isSidebarOpen = false;
  notificationsOpen = false;

  topAvatarUrl: string | null = null;
  isLoadingProfile = false;
  isLoadingAdvisers = false;

  notifications: NotificationItem[] = [];

  lugares = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles = ['Bachillerato', 'Universidad', 'Maestría'];
  materias = [
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

    this.filtros.valueChanges.pipe(
      startWith(this.filtros.value),
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(filters => this.fetchAdvisers(filters))
    ).subscribe(data => {
      this.advisers = data;
      this.cdr.detectChanges();
    });
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;

    if (this.notificationsOpen && this.notifications.length === 0) {
      this.notifications = [
        // Ejemplo de estructura
      ];
    }
  }

  private loadMyProfile(): Observable<void> {
    this.isLoadingProfile = true;

    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(profile => {
        this.topAvatarUrl = profile?.photoUrl ?? null;
      }),
      catchError(() => {
        this.topAvatarUrl = null;
        return of(null);
      }),
      tap(() => this.isLoadingProfile = false),
      map(() => void 0)
    );
  }

  fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http.get<AdviserCardResponse[]>(this.advisersApiUrl, { params }).pipe(
      map(api => api.map(a => this.mapApiToView(a))),
      catchError(() => of([])),
      tap(() => this.isLoadingAdvisers = false)
    );
  }

  private mapApiToView(api: AdviserCardResponse): AdviserCardView {
    return {
      id: api.userId,
      name: `${api.firstName} ${api.lastName}`,
      avatarUrl: api.photoUrl,
      nivel: api.level,
      tags: api.specialties ?? [],
      description: api.description,
      bookmarked: false
    };
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  clearFilters(): void {
    this.filtros.setValue({ search: '', lugar: '', nivel: '', materia: '' });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  toggleBookmark(a: AdviserCardView): void {
    a.bookmarked = !a.bookmarked;
  }

  trackByStr(_: number, v: string): string {
    return v;
  }

  trackById(_: number, v: AdviserCardView): number {
    return v.id;
  }

  onSeeMore(a: AdviserCardView): void {
    console.log('Detalles:', a);
  }

}


