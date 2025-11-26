import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AuthService, LoginRequest, AuthResponse} from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  public formData: LoginRequest = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    this.authService.login(this.formData).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login exitoso!', response);

        localStorage.setItem('token', response.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            roleId: response.roleId
          })
        );

        if (response.roleId === 1) {
          this.router.navigate(['/student-home']);
        } else if (response.roleId === 2) {
          this.router.navigate(['/dashboard-asesor']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error en el login', error);

        if (error.status === 401 || error.status === 404) {
          alert('Email o contraseña inválidos.');
        } else {
          alert('Error al intentar iniciar sesión. Inténtalo de nuevo.');
        }
      }
    });
  }
}
