import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css'
})
export class LandingPage {
  constructor(private router: Router) {}

  // Tus imágenes
  carouselImages = [
    '/Card1.png',
    '/Card2.png',
    '/Card3.png',
    '/Card4.png',
  ];

  currentIndex = 1; // Empezamos con la segunda imagen centrada (índice 1)

  // Mostrar 4 imágenes: 1 izquierda, 1 centro, 2 derecha (ajustable)
  get visibleSlides(): string[] {
    const start = Math.max(0, this.currentIndex - 1);
    const end = Math.min(this.carouselImages.length, start + 4);
    return this.carouselImages.slice(start, end);
  }

  isActive(index: number): boolean {
        const actualIndex = this.carouselImages.indexOf(this.visibleSlides[index]);
  return actualIndex === this.currentIndex;
  }

  isLeft(index: number): boolean {
    const actualIndex = this.carouselImages.indexOf(this.visibleSlides[index]);
  return actualIndex < this.currentIndex;
  }

  isRight(index: number): boolean {
      const actualIndex = this.carouselImages.indexOf(this.visibleSlides[index]);
  return actualIndex > this.currentIndex;
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

scrollToInicio(): void {
  const target = document.getElementById('Inicio');
  if (target) {
    target.scrollIntoView();
  }
}

scrollToDiferencia(): void {
  const target = document.getElementById('diferencia');
  if (target) {
    target.scrollIntoView();
  }
}
scrollToPreguntas(): void {
  const target = document.getElementById('preguntas');
  if (target) {
    target.scrollIntoView();
  }
}
  next(): void {
    if (this.currentIndex < this.carouselImages.length - 1) {
      this.currentIndex++;
    }
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}