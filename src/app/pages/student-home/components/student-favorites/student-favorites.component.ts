import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

// ✅ CORRECCIÓN 1: Rutas de importación ajustadas (4 niveles hacia arriba)
import { FavoritesService } from '../../../../core/services/favorites.service';
import { AdviserCardResponse } from '../../../../core/services/adviser.service';

// ✅ CORRECCIÓN 1: Ruta del modal (4 niveles hacia arriba)
import { AdviserDetailModalComponent, AdviserDetail } from '../../../../shared/components/adviser-detail-modal/adviser-detail-modal';

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
  selector: 'app-student-favorites',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AdviserDetailModalComponent],
  templateUrl: './student-favorites.component.html',
  styleUrls: ['./student-favorites.component.css']
})
export class StudentFavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private cdr = inject(ChangeDetectorRef);

  favorites: AdviserCardView[] = [];
  loading = true;

  // Modal Detalle
  isModalOpen = false;
  selectedAdviser: AdviserDetail | null = null;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.favoritesService.getMyFavoriteTeachers().subscribe({
      // ✅ CORRECCIÓN 2: Tipado explícito para 'data'
      next: (data: AdviserCardResponse[]) => {
        // ✅ CORRECCIÓN 3: Tipado explícito en el map
        this.favorites = data.map((a: AdviserCardResponse) => this.mapToView(a));
        this.loading = false;
        this.cdr.detectChanges();
      },
      // ✅ CORRECCIÓN 4: Tipado explícito para 'err' (any)
      error: (err: any) => {
        console.error('Error cargando favoritos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(teacherId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('¿Quitar de favoritos?')) return;

    this.favoritesService.removeFavorite(teacherId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.id !== teacherId);
        this.cdr.detectChanges();
      },
      // ✅ CORRECCIÓN 4: Tipado explícito para 'err'
      error: (err: any) => console.error(err)
    });
  }

  openDetail(adviser: AdviserCardView) {
    const detail: AdviserDetail = {
      ...adviser,
      rating: 0,
      reviews: []
    };
    this.selectedAdviser = detail;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedAdviser = null;
  }

  private mapToView(api: AdviserCardResponse): AdviserCardView {
    const subject = api.specialties && api.specialties.length ? api.specialties[0] : null;
    return {
      id: api.userId,
      name: `${api.firstName} ${api.lastName}`,
      avatarUrl: api.photoUrl,
      nivel: api.level,
      tags: api.specialties || [],
      description: api.description,
      bookmarked: true,
      subject,
      location: api.stateCode ?? null
    };
  }
}
