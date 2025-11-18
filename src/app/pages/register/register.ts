import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit {
  //Inyeccion de dependencias
  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute) {
  }

//Definicion de la url del endpoint de la API
  private apiUrl = 'http://localhost:8080/api/v1/auth/register';

  //Creamos un objeto con la finalidad de almacenar los datos del formulario
  //Este objeto ya coincide con el JSON que espera nuestra API
  public formData = {
    firstName: '',
    secondName: null, //Esto dato puede ser opcional, asi que por eso lo dejamos con null
    lastName: '',
    roleId: 0, // 0 Por defecto porque la logica es que se lea de la URL
    email: '',
    password: '',
  }

  ngOnInit(): void {
    //Aqui leemos los queryParams de la URL
    this.route.queryParams.subscribe(params => {
      const roleIdFromUrl = params['roleId'];
      if (roleIdFromUrl) {
        //Asignamos el roleId de la URL  a nuestro formulario
        //El '+' sirve para convertir el striong "1" en numero 1 (ESTUDIANTE)
        this.formData.roleId = +roleIdFromUrl;
      } else {
        //En caso de que no se provea el roleId, redirigira de vuelta al signup
        console.error('No se proveyo un roleId. Te redigiremos a Signup');
        this.router.navigate(['/signup']);
      }
    });
  }

  onSubmit() {
    //Ahora this.formData.roleId tendra el '1' o '2' que nos provee la URL
    if (this.formData.roleId === 0) {
      alert('Error: No se ha seleccionado un rol');
      return;
    }
    //Lineas de depuracion para que mis developers puedan entender si llegan a leer esto.
    console.log('Enviando los siguientes datos:', this.formData);
    //Aqui llamamos el endpoint de nuestra AGORA-API en KTOR
    this.http.post<any>(this.apiUrl, this.formData).subscribe(
      //En caso de exito
      (response) => {
        console.log('El registro ha sido exitoso y la respuesta del servidor ha sido:', response);
        //Usamos localstorage para guardar el token recibido y ayudarnos con la sesion
        localStorage.setItem('token', response.token);

        //Guardamos los datos del usuario por si los llegamos a usar despues:
        localStorage.setItem('user', JSON.stringify(
            {
              id: response.id,
              email: response.email,
              firstName: response.firstName,
              roleId: response.roleId,
            }
          )
        );

        //Aca redirigirmos al usuario (En este caso al login)
        alert('¡Registro exitoso! Te redigiremos al inicio de sesion');
        this.router.navigate(['/login']);
      },

      //Manejo de errores
      (error) => {
        console.error('Error en el registro', error);
        alert('Error en el registro' + (error.error.message || 'Error en el registro, intentalo de nuevo'));
      }
    );

  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToHome() {
  this.router.navigate(['/signup']);
}
}
