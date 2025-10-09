import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css'
})
export class LandingPage {
    constructor(private router: Router) {}

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
