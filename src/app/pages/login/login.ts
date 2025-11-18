import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  //Definicion de la URL de la API
  private apiUrl = 'http://localhost:8080/api/v1/auth/login';

  //Creamos un objeto para los datos del formulario
  //Este coincide con el JSON 'LoginRequest' de nuestra AGORA-API
  public formData = {
    email: '',
    password: '',
  }

  //Inyectamos las dependencias necesarias
  constructor(private router: Router, private http: HttpClient) {
  }

  //Funcion para navegar a Signup
  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToHome() {
  this.router.navigate(['/']); // tu ruta de inicio
}
  //Esta funcion llama al formulario
  onSubmit() {
    console.log('Enviando datos del login', this.formData);
    //Llamamos al endpoint de login
    this.http.post<any>(this.apiUrl, this.formData).subscribe(
      //En caso de exito
      response => {
        console.log('Login exitoso!', response);
        //Guardamos el token
        localStorage.setItem('token', response.token);

        //Guardamos los datos del usuario para usarlos despues en la App
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          roleId: response.roleId
        }));

        //En esta seccion se redirige segun ROL
        if (response.roleId === 1) {
          this.router.navigate(['/student-home']);
        } else if (response.roleId === 2) {
          this.router.navigate(['/dashboard-asesor']);
        } else {
          //Aca podriamos poner otro rol pero momentaneamente solo nos vamos a HOME
          this.router.navigate(['/landing-page']);
        }
      },

      //Manejo de errores
      (error) => {
        console.error('Error en el login', error);
        //Si hay un error 401 (Unauhthorized) es comun para datos incorrectos"
        if (error.status === 401 || error.status === 404) {
          alert('Email o contraseña invalidos.');
        } else {
          alert('Error al intentar iniciar sesion. Intentalo de nuevo.')
        }
      }
    );

  }
}
