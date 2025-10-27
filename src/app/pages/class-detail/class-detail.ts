import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router'; // ✅ necesario para [routerLink]

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './class-detail.html',
  styleUrls: ['./class-detail.css'],
})
export class ClassDetail {
  id = '';
  data = {
    titulo: 'Clase de Matemáticas I',
    nivel: 'Preparatoria',
    duracionMin: 60,
    descripcion: 'Álgebra básica y ejercicios guiados.',
    materias: ['Matemáticas'],
    tutorId: '1',
  };

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    // 🔌 TODO: GET /api/classes/:id -> asignar this.data con la respuesta real
  }
}


