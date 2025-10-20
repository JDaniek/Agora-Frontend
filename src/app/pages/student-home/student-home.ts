import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

type TutorCard = {
  id: string;
  name: string;
  nivel: string;
  lugar: string;
  avatarUrl?: string | null;
  tags: string[];
  description: string;
  bookmarked: boolean;
};

type FiltrosForm = FormGroup<{
  search: FormControl<string>;
  lugar: FormControl<string>;
  nivel: FormControl<string>;
  materia: FormControl<string>;
}>;

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css'],
})
export class StudentHome {
  /** Sidebar abierto/cerrado */
  sidebarOpen = signal<boolean>(false);

  /** Catálogos (pueden venir de API) */
  lugares = ['Aguascalientes','Baja California','Chiapas','CDMX','Jalisco','Nuevo León','Puebla','Yucatán'];
  niveles = ['Primaria','Secundaria','Preparatoria','Universidad','Posgrado','Técnico','Extracurricular'];
  materias = [
    'Ciencias exactas','Ciencias Naturales','Ciencias Sociales','Idiomas','Artes',
    'Humanidades','Comunicación','Arte y Creatividad','Negocio','Economía','Soft Skills','Salud','Bienestar'
  ];

  /** Íconos para materias (cámbienlos por SVG si quieren) */
  tagIcon: Record<string,string> = {
    'Ciencias exactas':'🧮','Ciencias Naturales':'🌿','Ciencias Sociales':'🧑‍🤝‍🧑','Idiomas':'🗣️','Artes':'🎨',
    'Humanidades':'📚','Comunicación':'📢','Arte y Creatividad':'🎭','Negocio':'💼','Economía':'📈','Soft Skills':'🤝','Salud':'🏥','Bienestar':'🌱'
  };
  iconFor(tag:string){ return this.tagIcon[tag] ?? '•'; }
  trackById = (_:number, t: TutorCard) => t.id;
  trackByStr = (_:number, s: string) => s;

  /** Form de filtros (no–nuleable por instancia directa) */
  filtros: FiltrosForm = new FormGroup<FiltrosForm['controls']>({
    search: new FormControl<string>('', {nonNullable:true}),
    lugar: new FormControl<string>('', {nonNullable:true}),
    nivel: new FormControl<string>('', {nonNullable:true}),
    materia: new FormControl<string>('', {nonNullable:true}),
  });

  /** Datos mock (reemplazar por fetch a API) */
  private seed: TutorCard[] = [
    { id:'1', name:'Nombre Usuario', nivel:'Universidad', lugar:'CDMX', avatarUrl:null,
      tags:['Ciencias exactas','Economía','Soft Skills'],
      description:'Esta es una pequeña descripción de la experiencia o práctica del asesorado.',
      bookmarked:false },
    { id:'2', name:'Nombre Usuario', nivel:'Preparatoria', lugar:'Chiapas', avatarUrl:null,
      tags:['Comunicación','Artes','Humanidades'],
      description:'Apoyo en regularización y proyectos. Enfoque práctico.',
      bookmarked:false },
    { id:'3', name:'Nombre Usuario', nivel:'Universidad', lugar:'Jalisco', avatarUrl:null,
      tags:['Idiomas','Ciencias Sociales'],
      description:'Conversación guiada y preparación de exámenes.',
      bookmarked:true },
    { id:'4', name:'Nombre Usuario', nivel:'Posgrado', lugar:'Nuevo León', avatarUrl:null,
      tags:['Negocio','Economía'],
      description:'Análisis de casos y finanzas personales.',
      bookmarked:false },
  ];

  /** Lista reactiva que debería venir de la API */
  tutors = signal<TutorCard[]>(this.seed);

  /** Filtro en cliente (cuando haya API, filtren del backend) */
  filtered = computed(() => {
    const { search, lugar, nivel, materia } = this.filtros.getRawValue();
    return this.tutors().filter(t => {
      const s = search.trim().toLowerCase();
      const okSearch = !s || t.name.toLowerCase().includes(s);
      const okLugar  = !lugar || t.lugar === lugar;
      const okNivel  = !nivel || t.nivel === nivel;
      const okMate   = !materia || t.tags.includes(materia);
      return okSearch && okLugar && okNivel && okMate;
    });
  });

  toggleSidebar(){ this.sidebarOpen.set(!this.sidebarOpen()); }
  clearFilters(){ this.filtros.reset({search:'',lugar:'',nivel:'',materia:''}); }

  toggleBookmark(t: TutorCard){
    this.tutors.update(list => list.map(x => x.id===t.id ? {...x, bookmarked: !x.bookmarked} : x));
    // 🔌 TODO API: PATCH /api/tutors/:id/bookmark (body: { bookmarked: boolean })
  }

  /** --------- INTEGRACIÓN API (comentarios) ----------
   * 1) Cargar catálogos:
   *    CatalogService.getLugares()/getNiveles()/getMaterias()
   *    .subscribe(data => { this.lugares = data.lugares; ... })
   *
   * 2) Buscar tutores con filtros:
   *    TutorService.search(this.filtros.getRawValue())
   *    .subscribe(items => this.tutors.set(items));
   *
   * 3) Avatares en Cloudinary:
   *    Viene ya como URL en cada card (p.ej. avatarUrl) → usar [src]="t.avatarUrl"
   * -------------------------------------------------- */
}

