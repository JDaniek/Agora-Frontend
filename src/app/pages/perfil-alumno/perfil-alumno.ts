// perfil-alumno.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StudentProfile {
  name: string;
  lastName: string;
  photoUrl: string | null;
  level: string;
  interests: string[];
  city: string;
  state: string;
}

@Component({
  selector: 'app-perfil-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-alumno.html',
  styleUrls: ['./perfil-alumno.css'],
})
export class PerfilAlumnoComponent {
  profile: StudentProfile = {
    name: 'Carlos',
    lastName: 'Mazariegos',
    photoUrl: null,
    level: 'Universidad',
    interests: ['Programación', 'Matemáticas'],
    city: 'Tuxtla Gutiérrez',
    state: 'Chiapas',
  };

  allInterests: string[] = [
    'Programación',
    'Matemáticas',
    'Idiomas',
    'Física',
    'Literatura',
    'Historia',
  ];

  saveSuccess = false;
  photoPreview: string | null = null;

  saveProfile(): void {
    this.saveSuccess = true;

    setTimeout(() => {
      this.saveSuccess = false;
    }, 2000);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview = reader.result as string;
      this.profile.photoUrl = this.photoPreview;
    };

    reader.readAsDataURL(file);
  }
}

