import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AdviserService, ReviewResponse } from '../../../../core/services/adviser.service';

@Component({
  selector: 'app-student-reviews',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './student-reviews.component.html',
  styleUrls: ['./student-reviews.component.css']
})
export class StudentReviewsComponent implements OnInit {
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
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;

    // 👇 LLAMADA AL NUEVO MÉTODO DEL SERVICIO
    this.adviserService.getMyStudentReviews().subscribe({
      next: (data) => {
        console.log('Evaluaciones recibidas:', data);
        this.reviews = data || [];
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando evaluaciones', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateStats() {
    const total = this.reviews.length;
    if (total === 0) {
      this.stats = { average: 0, total: 0, starsDistribution: [0,0,0,0,0] };
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
