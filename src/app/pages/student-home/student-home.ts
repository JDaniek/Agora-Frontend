import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router'; // ✅

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // ✅ RouterLink aquí
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css'],
})
export class StudentHome {
  sidebarOpen = signal<boolean>(false);

  lugares = ['Aguascalientes','Baja California','Chiapas','CDMX','Jalisco','Nuevo León','Puebla','Yucatán'];
  niveles = ['Primaria','Secundaria','Preparatoria','Universidad','Posgrado','Técnico','Extracurricular'];
  materias = [
    'Ciencias exactas','Ciencias Naturales','Ciencias Sociales','Idiomas','Artes',
    'Humanidades','Comunicación','Arte y Creatividad','Negocio','Economía','Soft Skills','Salud','Bienestar'
  ];

  tagIcon: Record<string,string> = {
    'Ciencias exactas':'🧮','Ciencias Naturales':'🌿','Ciencias Sociales':'🧑‍🤝‍🧑','Idiomas':'🗣️','Artes':'🎨',
    'Humanidades':'📚','Comunicación':'📢','Arte y Creatividad':'🎭','Negocio':'💼','Economía':'📈','Soft Skills':'🤝','Salud':'🏥','Bienestar':'🌱'
  };
  iconFor(tag:string){ return this.tagIcon[tag] ?? '•'; }
  trackById = (_:number, t: TutorCard) => t.id;
  trackByStr = (_:number, s: string) => s;

  filtros: FiltrosForm = new FormGroup<FiltrosForm['controls']>({
    search: new FormControl<string>('', {nonNullable:true}),
    lugar:  new FormControl<string>('', {nonNullable:true}),
    nivel:  new FormControl<string>('', {nonNullable:true}),
    materia:new FormControl<string>('', {nonNullable:true}),
  });

  private seed: TutorCard[] = [
    { id:'1', name:'Nombre Usuario', nivel:'Universidad', lugar:'CDMX', avatarUrl:null, tags:['Ciencias exactas','Economía','Soft Skills'], description:'Pequeña descripción…', bookmarked:false },
    { id:'2', name:'Nombre Usuario', nivel:'Preparatoria', lugar:'Chiapas', avatarUrl:null, tags:['Comunicación','Artes','Humanidades'], description:'Regularización y proyectos.', bookmarked:false },
    { id:'3', name:'Nombre Usuario', nivel:'Universidad', lugar:'Jalisco', avatarUrl:null, tags:['Idiomas','Ciencias Sociales'], description:'Preparación de exámenes.', bookmarked:true },
    { id:'4', name:'Nombre Usuario', nivel:'Posgrado', lugar:'Nuevo León', avatarUrl:null, tags:['Negocio','Economía'], description:'Casos y finanzas personales.', bookmarked:false },
  ];

  tutors = signal<TutorCard[]>(this.seed);

  filtered = computed(() => {
    const { search, lugar, nivel, materia } = this.filtros.getRawValue();
    return this.tutors().filter(t => {
      const s = search.trim().toLowerCase();
      const okSearch = !s || t.name.toLowerCase().includes(s) || t.tags.some(x => x.toLowerCase().includes(s));
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
    // 🔌 TODO API: PATCH /api/tutors/:id/bookmark
  }
}



