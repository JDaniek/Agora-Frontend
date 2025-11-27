import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  /** Opción seleccionada en la tarjeta (asesor | alumno) */
  public selectedOption: string | null = null;

  constructor(private router: Router) {}

  /** Marca la opción seleccionada para activar el botón "Continuar" */
  selectOption(option: string): void {
    this.selectedOption = option;
  }

  /** Navega al formulario de registro con el roleId que espera el backend */
  goToNextStep(): void {
    if (!this.selectedOption) {
      return;
    }

    // Mapeo simple: alumno = 1, asesor = 2 (según base de datos)
    const roleId = this.selectedOption === 'alumno' ? 1 : 2;

    console.log('Opción seleccionada:', this.selectedOption, 'roleId:', roleId);

    this.router.navigate(['/register'], {
      queryParams: { roleId },
    });
  }

  /** Vuelve a la landing principal */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}

