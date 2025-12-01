import {Component, OnInit, OnChanges, SimpleChanges, Input, inject, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup} from '@angular/forms';
import {map, catchError} from 'rxjs/operators';
import {of} from 'rxjs';

// Servicios
import {AdviserService, AdviserCardResponse} from '../../../../core/services/adviser.service';
import {
  AdviserDetailModalComponent,
  AdviserDetail,
  Review
} from '../../../../shared/components/adviser-detail-modal/adviser-detail-modal';

// Interfaz para la vista
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
  // Importamos el componente del modal para usarlo en el HTML
  imports: [CommonModule, ReactiveFormsModule, AdviserDetailModalComponent],
  templateUrl: './advisor-list.component.html',
  styleUrls: ['./advisor-list.component.css']
})
export class AdvisorListComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private adviserService = inject(AdviserService);
  private cdr = inject(ChangeDetectorRef);

  // --- 1. INPUTS DESDE EL PADRE (STUDENT-HOME) ---
  @Input() searchTerm: string = '';
  @Input() filterLugar: string = '';
  @Input() filterNivel: string = '';
  @Input() filterMateria: string = '';

  // Estados internos
  isLoadingAdvisers = false;
  allAdvisers: AdviserCardView[] = []; // Copia completa para filtrar localmente
  advisers: AdviserCardView[] = [];    // Lista filtrada que se muestra

  filtros: FormGroup; // Se mantiene para compatibilidad con el HTML existente

  // Modal
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  // Catálogos locales (usados por el HTML interno si se usa, aunque ahora mandan los inputs)
  lugares: string[] = []; // Se llenarán si es necesario, pero el filtro viene de fuera
  niveles: string[] = [];
  materias: { id: number; name: string }[] = [];

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
  }

  // --- 2. REACCIONAR A CAMBIOS DEL PADRE ---
  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['searchTerm'] ||
        changes['filterLugar'] ||
        changes['filterNivel'] ||
        changes['filterMateria']) &&
      this.allAdvisers.length > 0
    ) {
      this.applyFilters({
        search: this.searchTerm,
        lugar: this.filterLugar,
        nivel: this.filterNivel,
        materia: this.filterMateria
      });
    }
  }

  private loadInitialAdvisers(): void {
    this.isLoadingAdvisers = true;
    this.adviserService.getAdvisers().pipe(
      map((response: AdviserCardResponse[]) => response.map(a => this.mapApiToView(a))),
      catchError(err => {
        console.error('Error cargando asesores', err);
        return of<AdviserCardView[]>([]);
      })
    ).subscribe(data => {
      this.allAdvisers = data;
      // Aplicar filtros iniciales (por si el padre ya mandó algo)
      this.applyFilters({
        search: this.searchTerm,
        lugar: this.filterLugar,
        nivel: this.filterNivel,
        materia: this.filterMateria
      });
      this.isLoadingAdvisers = false;
      this.cdr.detectChanges();
    });
  }

  // --- 3. LÓGICA DE FILTRADO ---
  private applyFilters(overrides?: { search?: string; lugar?: string; nivel?: string; materia?: string }): void {
    // Prioridad: Overrides (Inputs) > Formulario interno
    const search = overrides?.search ?? this.filtros.value.search;
    const lugar = overrides?.lugar ?? this.filtros.value.lugar;
    const nivel = overrides?.nivel ?? this.filtros.value.nivel;
    const materia = overrides?.materia ?? this.filtros.value.materia;

    const term = (search || '').toLowerCase().trim();

    this.advisers = this.allAdvisers.filter(adviser => {
      const matchesSearch = !term || [
        adviser.name,
        adviser.description,
        adviser.subject,
        (adviser.tags || []).join(' ')
      ].join(' ').toLowerCase().includes(term);

      const matchesLugar = !lugar || adviser.location === lugar;
      const matchesNivel = !nivel || adviser.nivel === nivel;
      // Filtro de materia: busca si alguno de los tags coincide
      const matchesMateria = !materia || (adviser.tags || []).some(t => t.toLowerCase().includes(String(materia).toLowerCase()));

      return matchesSearch && matchesLugar && matchesNivel && matchesMateria;
    });
  }

  // Funciones para el formulario interno (si se usa desde el HTML del hijo)
  clearFilters(): void {
    this.filtros.reset({search: '', lugar: '', nivel: '', materia: ''});
    // Si limpias desde aquí, idealmente deberías avisar al padre, pero por ahora filtra local
    this.applyFilters();
  }

  // Mapeo de respuesta API a Vista
  private mapApiToView(adviser: AdviserCardResponse): AdviserCardView {
    const subject = adviser.specialties && adviser.specialties.length ? adviser.specialties[0] : null;
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

  // --- LÓGICA DEL MODAL ---
  openAdviserDetail(adviser: AdviserCardView): void {
    // Mapeamos AdviserCardView a AdviserDetail (son compatibles casi al 100%)
    const detail: AdviserDetail = {
      ...adviser,
      rating: 0, // Se cargará en el modal
      reviews: [] // Se cargarán en el modal
    };
    this.selectedAdviser = detail;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAdviser = null;
  }
}
