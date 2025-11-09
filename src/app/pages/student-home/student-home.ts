// --- 1. IMPORTA ChangeDetectorRef ---
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

// (Tus interfaces están perfectas aquí)
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

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHome implements OnInit {

  // ... (propiedades) ...
  private apiUrl = 'http://localhost:8080/api/v1/advisers';
  isSidebarOpen = false;
  lugares: string[] = ["CHIS", "JAL", "CDMX", "NL"];
  niveles: string[] = ["Bachillerato", "Universidad", "Maestría"];
  materias: any[] = [
    { id: 1, name: "Ciencias Naturales" },
    { id: 2, name: "Idiomas" },
    { id: 3, name: "Artes" }
  ];
  filtros: FormGroup;
  advisers: AdviserCardView[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    // --- 2. INYECTA EL 'cdr' ---
    private cdr: ChangeDetectorRef
  ) {
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit() {
    this.filtros.valueChanges.pipe(
      startWith(this.filtros.value),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(filterValues => this.fetchAdvisers(filterValues))
    ).subscribe(mappedData => {
      console.log("StudentHome: Datos RECIBIDOS en subscribe()", mappedData);
      this.advisers = mappedData;

      // --- 3. ¡¡AQUÍ ESTÁ EL ARREGLO!! ---
      // Le decimos a Angular: "Oye, actualicé los datos, ¡repinta el HTML!"
      this.cdr.detectChanges();
    });
  }

  // ... (El resto de tus funciones: fetchAdvisers, mapApiToView, etc. están perfectas) ...
  fetchAdvisers(filters: any = {}): Observable<AdviserCardView[]> {
    let params = new HttpParams();

    if (filters.search) {
      params = params.set('q', filters.search);
    }
    if (filters.lugar) {
      params = params.set('state', filters.lugar);
    }
    if (filters.nivel) {
      params = params.set('level', filters.nivel);
    }
    if (filters.materia) {
      params = params.set('specialty', filters.materia);
    }

    return this.http.get<AdviserCardResponse[]>(this.apiUrl, { params }).pipe(
      tap(apiResponse => console.log("StudentHome: Datos CRUDOS recibidos de la API", apiResponse)),
      map(apiResponse => apiResponse.map(adviser => this.mapApiToView(adviser)))
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

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar() { this.isSidebarOpen = false; }
  trackByStr(index: number, str: string): string { return str; }
  trackById(index:number, item: AdviserCardView): number { return item.id; }
  clearFilters() {
    this.filtros.setValue({ search: '', lugar: '', nivel: '', materia: '' });
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  toggleBookmark(adviser: AdviserCardView) { adviser.bookmarked = !adviser.bookmarked; }
  iconFor(tag: string): string { return '📚'; }
}
