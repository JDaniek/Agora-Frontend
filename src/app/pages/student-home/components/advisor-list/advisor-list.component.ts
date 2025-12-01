import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

// Ya no necesitamos ReactiveForms, ni AdviserService aquí
import {
  AdviserDetailModalComponent,
  AdviserDetail
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
  imports: [CommonModule, AdviserDetailModalComponent],
  templateUrl: './advisor-list.component.html',
  styleUrls: ['./advisor-list.component.css']
})
export class AdvisorListComponent {
  // 🔹 Ahora solo recibimos la lista ya armada desde el padre
  @Input() advisers: AdviserCardView[] = [];
  @Input() isLoadingAdvisers: boolean = false;

  // Modal
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  // --- LÓGICA DEL MODAL ---
  openAdviserDetail(adviser: AdviserCardView): void {
    const detail: AdviserDetail = {
      ...adviser,
      rating: 0,  // Se cargará dentro del modal
      reviews: [] // Se cargarán dentro del modal
    };
    this.selectedAdviser = detail;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAdviser = null;
  }
}
