import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, tap, catchError } from 'rxjs/operators';
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
  photoUrl: string | null;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit {

  advisersApiUrl = 'http://localhost:8080/api/v1/advisers';
  profileApiUrl  = 'http://localhost:8080/api/v1/profile';

  filtros: FormGroup;
  advisers: AdviserCardView[] = [];

  lugares = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles = ['Bachillerato', 'Universidad', 'Maestría'];
  materias = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    { id: 3, name: 'Artes' }
  ];

  isLoadingAdvisers = false;
  isSidebarOpen = false;
  notificationsOpen = false;

  topAvatarUrl: string | null = null;

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
    this.setupFilterListener();
  }

  setupFilterListener() {
    this.filtros.valueChanges.pipe(
      startWith(this.filtros.value),
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(values => this.fetchAdvisers(values))
    )
    .subscribe(res => {
      this.advisers = res;
      this.cdr.detectChanges();
    });
  }

  loadMyProfile(): Observable<void> {
    return this.http.get<ProfileResponse>(this.profileApiUrl).pipe(
      tap(p => this.topAvatarUrl = p.photoUrl),
      catchError(() => of(void 0)),
      map(() => void 0)
    );
  }

  fetchAdvisers(filters: any): Observable<AdviserCardView[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('q', filters.search);
    if (filters.lugar) params = params.set('state', filters.lugar);
    if (filters.nivel) params = params.set('level', filters.nivel);
    if (filters.materia) params = params.set('specialty', filters.materia);

    this.isLoadingAdvisers = true;

    return this.http.get<AdviserCardResponse[]>(this.advisersApiUrl, { params }).pipe(
      map(res => res.map(a => ({
        id: a.userId,
        name: `${a.firstName} ${a.lastName}`,
        avatarUrl: a.photoUrl,
        nivel: a.level,
        tags: a.specialties,
        description: a.description,
        bookmarked: false
      }))),
      catchError(() => of([])),
      tap(() => this.isLoadingAdvisers = false)
    );
  }

  toggleSidebar() { this.isSidebarOpen = true; }
  closeSidebar() { this.isSidebarOpen = false; }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
  }

  clearFilters() {
    this.filtros.setValue({ search: '', lugar: '', nivel: '', materia: '' });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  toggleBookmark(t: AdviserCardView) {
    t.bookmarked = !t.bookmarked;
  }

  onSeeMore(t: AdviserCardView) {
    console.log(t);
  }

  trackById(_: number, item: AdviserCardView) { return item.id; }
}


