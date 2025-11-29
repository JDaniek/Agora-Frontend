import {Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdviserService, ReviewResponse} from '../../../../core/services/adviser.service';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-mis-resenas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule], //  añadimos el módulo
  templateUrl: './mis-resenas.component.html',
  styleUrls: ['./mis-resenas.component.css']
})
export class MisResenasComponent implements OnInit {
  private adviserService = inject(AdviserService);
  private cdr = inject(ChangeDetectorRef);

  reviews: ReviewResponse[] = [];
  loading = true;

  stats = {
    average: 0,
    total: 0,
    starsDistribution: [0, 0, 0, 0, 0]
  };

  ngOnInit() {
    this.loadMyReviews();
  }

  loadMyReviews() {
    this.loading = true;
    console.log('Cargando reseñas...');

    this.adviserService.getMyReviews().subscribe({
      next: (data) => {
        console.log('Reseñas recibidas:', data);
        this.reviews = data || [];
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando reseñas', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateStats() {
    const total = this.reviews.length;
    if (total === 0) {
      this.stats = {average: 0, total: 0, starsDistribution: [0, 0, 0, 0, 0]};
      return;
    }

    let sum = 0;
    const distribution = [0, 0, 0, 0, 0];

    this.reviews.forEach(r => {
      sum += r.rating;
      const index = Math.max(0, Math.min(4, Math.round(r.rating) - 1));
      distribution[index]++;
    });

    this.stats = {
      total,
      average: sum / total,
      starsDistribution: distribution.reverse()
    };
  }
}
