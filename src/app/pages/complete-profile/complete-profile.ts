import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup
} from '@angular/forms';

type Opcion = { value: string; label: string };

type PerfilForm = FormGroup<{
  lugar: FormControl<string>;
  nivel: FormControl<string>;
  intereses: FormControl<string>;
}>;

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.css'],
})
export class CompleteProfile {
  // Catálogos (luego se mueven a un servicio)
  estadosMx: Opcion[] = [
    { value: 'ags', label: 'Aguascalientes' }, { value: 'bc', label: 'Baja California' },
    { value: 'bcs', label: 'Baja California Sur' }, { value: 'camp', label: 'Campeche' },
    { value: 'coah', label: 'Coahuila' }, { value: 'col', label: 'Colima' },
    { value: 'chis', label: 'Chiapas' }, { value: 'chih', label: 'Chihuahua' },
    { value: 'cdmx', label: 'Ciudad de México' }, { value: 'dgo', label: 'Durango' },
    { value: 'gto', label: 'Guanajuato' }, { value: 'gro', label: 'Guerrero' },
    { value: 'hgo', label: 'Hidalgo' }, { value: 'jal', label: 'Jalisco' },
    { value: 'edomex', label: 'México' }, { value: 'mich', label: 'Michoacán' },
    { value: 'mor', label: 'Morelos' }, { value: 'nay', label: 'Nayarit' },
    { value: 'nl', label: 'Nuevo León' }, { value: 'oax', label: 'Oaxaca' },
    { value: 'pue', label: 'Puebla' }, { value: 'qro', label: 'Querétaro' },
    { value: 'qroo', label: 'Quintana Roo' }, { value: 'slp', label: 'San Luis Potosí' },
    { value: 'sin', label: 'Sinaloa' }, { value: 'son', label: 'Sonora' },
    { value: 'tab', label: 'Tabasco' }, { value: 'tamps', label: 'Tamaulipas' },
    { value: 'tlax', label: 'Tlaxcala' }, { value: 'ver', label: 'Veracruz' },
    { value: 'yuc', label: 'Yucatán' }, { value: 'zac', label: 'Zacatecas' },
  ];

  niveles: Opcion[] = [
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'preparatoria', label: 'Preparatoria' },
    { value: 'universidad', label: 'Universidad' },
    { value: 'posgrado', label: 'Posgrado' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'tecnico', label: 'Técnico' },
  ];

  tagsDisponibles: string[] = [
    'Ciencias exactas', 'Ciencias Naturales', 'Ciencias Sociales', 'Idiomas', 'Artes',
    'Humanidades', 'Comunicación', 'Arte y Creatividad', 'Negocio', 'Economía',
    'Soft Skills', 'Salud', 'Bienestar'
  ];

  // UI state (signals sencillos)
  selectedTags = signal<Set<string>>(new Set<string>());
  avatarPreview = signal<string | null>(null);
  isSaving = signal(false);

  // Form con controles NO nuleables (nonNullable en cada control)
  form: PerfilForm = new FormGroup<PerfilForm['controls']>({
    lugar: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    nivel: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    intereses: new FormControl<string>('', { nonNullable: true })
  });

  // trackBy para *ngFor
  trackByTag = (_: number, item: string) => item;

  // Payload listo para API
  payload = computed(() => {
    const { lugar, nivel, intereses } = this.form.getRawValue(); // ya son string, no null
    return {
      lugar,
      nivel,
      intereses: intereses.trim(),
      tags: Array.from(this.selectedTags()),
      // avatar: subir archivo/URL cuando definan backend
    };
  });

  toggleTag(tag: string) {
    const next = new Set(this.selectedTags());
    next.has(tag) ? next.delete(tag) : next.add(tag);
    this.selectedTags.set(next);
  }

  isSelected(tag: string) {
    return this.selectedTags().has(tag);
  }

  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    setTimeout(() => {
      console.log('Payload listo para API:', this.payload());
      this.isSaving.set(false);
      alert('Perfil guardado (mock)');
    }, 600);
  }
}
