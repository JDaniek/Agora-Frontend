import {Component, Input, inject} from '@angular/core';
import {CommonModule} from '@angular/common';

// Importamos el modal
import {
  AdviserDetailModalComponent,
  AdviserDetail
} from '../../../../shared/components/adviser-detail-modal/adviser-detail-modal';

// Importamos el servicio de favoritos para la estrella
import {FavoritesService} from '../../../../core/services/favorites.service';

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
  // Inyección del servicio
  private favoritesService = inject(FavoritesService);

  // 🔹 Entradas desde el padre
  @Input() advisers: AdviserCardView[] = [];
  @Input() isLoadingAdvisers: boolean = false;

  // Modal
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  // --- LÓGICA DE FAVORITOS (ESTRELLA) ---
  toggleFavorite(adviser: AdviserCardView, event: Event) {
    event.stopPropagation(); // Evita que se abra el modal al dar clic en la estrella

    if (adviser.bookmarked) {
      // Quitar de favoritos
      this.favoritesService.removeFavorite(adviser.id).subscribe({
        next: () => (adviser.bookmarked = false),
        error: (err) => console.error('Error al quitar favorito', err)
      });
    } else {
      // Agregar a favoritos
      this.favoritesService.addFavorite(adviser.id).subscribe({
        next: () => (adviser.bookmarked = true),
        error: (err) => console.error('Error al agregar favorito', err)
      });
    }
  }

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
