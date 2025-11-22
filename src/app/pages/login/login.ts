import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  /** Endpoint de login de la API de Ágora */
  private apiUrl = 'http://localhost:8080/api/v1/auth/login';

  /**
   * Modelo de datos del formulario.
   * Debe coincidir con el JSON LoginRequest del backend.
   */
  public formData = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /** Navegar a la pantalla de selección de rol (signup) */
  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  /** Volver a la landing principal */
  navigateToHome() {
    this.router.navigate(['/']);
  }

  /** Enviar formulario de login */
  onSubmit() {
    console.log('Enviando datos del login', this.formData);

    this.http.post<any>(this.apiUrl, this.formData).subscribe(
      response => {
        console.log('Login exitoso!', response);

        // Guardar token
        localStorage.setItem('token', response.token);

        // Guardar datos básicos del usuario
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            roleId: response.roleId
          })
        );

        // Redirección según rol
        if (response.roleId === 1) {
          this.router.navigate(['/student-home']);
        } else if (response.roleId === 2) {
          this.router.navigate(['/dashboard-asesor']);
        } else {
          // Fallback temporal
          this.router.navigate(['/']);
        }
      },
      error => {
        console.error('Error en el login', error);

        if (error.status === 401 || error.status === 404) {
          alert('Email o contraseña inválidos.');
        } else {
          alert('Error al intentar iniciar sesión. Inténtalo de nuevo.');
        }
      }
    );
  }
}
