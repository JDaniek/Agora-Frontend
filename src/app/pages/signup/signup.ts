import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Para navegación

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  // Variable que almacena la opción seleccionada
  selectedOption: string | null = null;

  // Constructor con el Router para la navegación
  constructor(private router: Router) {}

  // Método para manejar la opción seleccionada
  selectOption(option: string) {
    this.selectedOption = option; // Establece la opción seleccionada
  }

  // Método para redirigir cuando se presiona el botón "Continuar"
  goToNextStep() {
    console.log('Opción seleccionada:', this.selectedOption);
    // Redirigir a la siguiente página
    this.router.navigate(['/registro-correo']); // Cambiar ruta según tu necesidad
  }
}
