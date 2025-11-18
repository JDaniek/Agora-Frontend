import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router'; // Para navegación
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  public selectedOption: string | null = null;


//Inyectamos la dependencia router
  constructor(private router: Router) {
  }

  // Método para manejar la opción seleccionada
  selectOption(option: string) {
    this.selectedOption = option; // Establece la opción seleccionada
  }

  // Método para redirigir cuando se presiona el botón "Continuar"
  goToNextStep() {
    if (!this.selectedOption) {
      return;
    }
    //Mapeamos el string al ID que esta en la Base De Datos
    const roleId = (this.selectedOption === 'alumno') ? 1 : 2;
    //Linea de depuracion
    console.log('Opción seleccionada:', this.selectedOption);
    // Redirigir a la siguiente página
    this.router.navigate(['/register'],
      {
        queryParams: {roleId: roleId}
      });
  }

  navigateToHome() {
  this.router.navigate(['/']); // tu ruta de inicio
}
}
