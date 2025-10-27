import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router'; // ✅

@Component({
  selector: 'app-tutor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink], // ✅
  templateUrl: './tutor-profile.html',
  styleUrls: ['./tutor-profile.css'],
})
export class TutorProfile {
  id = '';
  tutor = {
    nombre: 'Nombre Tutor',
    nivel: 'Universidad',
    lugar: 'Chiapas',
    tags: ['Economía','Soft Skills'],
    descripcion: 'Descripción breve del tutor y su experiencia…',
    avatarUrl: ''
  };

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    // 🔌 TODO: GET /api/tutors/:id -> asignar this.tutor
  }
}



