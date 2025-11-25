import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Review {
  userPhoto: string | null;
  userName: string;
  text: string;
  rating: number;
}

export interface AdviserDetail {
  id: number;
  name: string;
  avatarUrl: string | null;
  nivel: string | null;
  tags: string[];
  description: string | null;
  rating: number;
  reviews: Review[];
}

@Component({
  selector: 'app-adviser-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adviser-detail-modal.html',
  styleUrls: ['./adviser-detail-modal.css']
})
export class AdviserDetailModal {
  @Input() adviser: AdviserDetail | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() writeMessage = new EventEmitter<number>();

  closeModal() {
    this.close.emit();
  }

  onWriteMessage() {
    if (this.adviser) {
      this.writeMessage.emit(this.adviser.id);
    }
  }

  getStarsArray(): boolean[] {
    const rating = this.adviser?.rating || 0;
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  trackByIndex(index: number): number {
    return index;
  }
}
