import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  /** Endpoint de registro de la API */
  private apiUrl = 'http://localhost:8080/api/v1/auth/register';

  /**
   * Modelo del formulario.
   * Coincide con el JSON que espera el backend en RegisterRequest.
   */
  public formData: {
    firstName: string;
    secondName: string | null;
    lastName: string;
    roleId: number;
    email: string;
    password: string;
  } = {
    firstName: '',
    secondName: null,  // opcional
    lastName: '',
    roleId: 0,         // se completa leyendo los query params
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Leemos el roleId desde la URL (?roleId=1 o 2) para saber si es alumno o asesor.
    this.route.queryParams.subscribe(params => {
      const roleIdFromUrl = params['roleId'];

      if (roleIdFromUrl) {
        this.formData.roleId = +roleIdFromUrl; // "1" -> 1
      } else {
        console.error('No se proporcionó un roleId. Redirigiendo a selección de rol (signup).');
        this.router.navigate(['/signup']);
      }
    });
  }

  onSubmit(): void {
    // Si por alguna razón no se recibió roleId, no permitimos continuar.
    if (this.formData.roleId === 0) {
      alert('Error: No se ha seleccionado un rol.');
      return;
    }

    console.log('Enviando los siguientes datos de registro:', this.formData);

    this.http.post<any>(this.apiUrl, this.formData).subscribe(
      // Éxito
      (response) => {
        console.log('Registro exitoso. Respuesta del servidor:', response);

        // Guardamos token para mantener la sesión
        localStorage.setItem('token', response.token);

        // Guardamos datos básicos del usuario
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          roleId: response.roleId
        }));

        alert('¡Registro exitoso! Te redireccionaremos al inicio de sesión.');
        this.router.navigate(['/login']);
      },
      // Error
      (error) => {
        console.error('Error en el registro', error);
        const backendMessage = error?.error?.message;
        alert('Error en el registro: ' + (backendMessage || 'Inténtalo de nuevo más tarde.'));
      }
    );
  }

  /** Ir a la pantalla de login */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Volver a la selección de rol (pantalla de signup),
   * se usa desde el botón de regreso.
   */
  navigateToHome(): void {
    this.router.navigate(['/signup']);
  }
}

