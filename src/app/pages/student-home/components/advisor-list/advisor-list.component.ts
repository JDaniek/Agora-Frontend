import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  map,
  tap,
  catchError
} from 'rxjs/operators';
import { of } from 'rxjs';

// Servicios
import { AdviserService, AdviserCardResponse } from '../../../../core/services/adviser.service';

// Componentes Compartidos
import {
  AdviserDetailModalComponent,
  AdviserDetail,
  Review
} from '../../../../shared/components/adviser-detail-modal/adviser-detail-modal';

/* Interfaces Locales (Movidas desde student-home) */
export interface AdviserCardView {
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

@Component({
  selector: 'app-advisor-list',
  standalone: true,
  // ⬇️ usar AdviserDetailModalComponent aquí
  imports: [CommonModule, ReactiveFormsModule, AdviserDetailModalComponent],
  templateUrl: './advisor-list.component.html',
  styleUrls: ['./advisor-list.component.css']
})
export class AdvisorListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adviserService = inject(AdviserService);
  private cdr = inject(ChangeDetectorRef);

  // Estados
  isLoadingAdvisers = false;
  allAdvisers: AdviserCardView[] = [];
  advisers: AdviserCardView[] = [];

  // Filtros
  filtros: FormGroup;
  lugares: string[] = ['CHIS', 'JAL', 'CDMX', 'NL'];
  niveles: string[] = ['Bachillerato', 'Universidad', 'Maestría'];
  materias: { id: number; name: string }[] = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    { id: 3, name: 'Artes' }
  ];

  // Modal Detalle
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  constructor() {
    this.filtros = this.fb.group({
      search: [''],
      lugar: [''],
      nivel: [''],
      materia: ['']
    });
  }

  ngOnInit() {
    this.loadInitialAdvisers();
    this.setupFilters();
  }

  // --- LÓGICA DE CARGA ---
  private loadInitialAdvisers(): void {
    this.isLoadingAdvisers = true;
    this.adviserService
      .getAdvisers()
      .pipe(
        map((response: AdviserCardResponse[]) =>
          response.map(a => this.mapApiToView(a))
        ),
        catchError(err => {
          console.error('Error al obtener asesores', err);
          return of<AdviserCardView[]>([]);
        })
      )
      .subscribe(data => {
        this.allAdvisers = data;
        this.applyFilters(); // Aplicar filtros iniciales
        this.isLoadingAdvisers = false;
        this.cdr.detectChanges();
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

  // --- LÓGICA DE FILTROS ---
  private setupFilters() {
    this.filtros.valueChanges
      .pipe(
        startWith(this.filtros.value),
        debounceTime(200),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => this.applyFilters());
  }

  private applyFilters(): void {
    const { search, lugar, nivel, materia } = this.filtros.value;
    const searchTerm = (search || '').toLowerCase().trim();

    this.advisers = this.allAdvisers.filter(adviser => {
      const matchesSearch =
        !searchTerm ||
        [
          adviser.name,
          adviser.description,
          adviser.subject,
          (adviser.tags || []).join(' ')
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm);

      const matchesLugar = !lugar || adviser.location === lugar;
      const matchesNivel = !nivel || adviser.nivel === nivel;
      const matchesMateria =
        !materia ||
        (adviser.tags || []).some(t =>
          t.toLowerCase().includes(String(materia).toLowerCase())
        );

      return matchesSearch && matchesLugar && matchesNivel && matchesMateria;
    });
  }

  clearFilters(): void {
    this.filtros.reset({ search: '', lugar: '', nivel: '', materia: '' });
  }

  // --- LÓGICA DEL MODAL ---
  openAdviserDetail(adviser: AdviserCardView): void {
    const mockReviews: Review[] = [
      {
        userPhoto: null,
        userName: 'Juan Pérez',
        text: 'Excelente asesor.',
        rating: 5
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
}
