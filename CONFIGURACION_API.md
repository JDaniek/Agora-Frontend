# Configuración Angular + Ktor Backend

## ✅ Configuración Completa

### 1. Entornos (`src/environments/`)

#### `environment.ts` (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

#### `environment.prod.ts` (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-produccion.com'
};
```

### 2. ProfileService (`src/app/core/services/profile.ts`)

El servicio ya está creado con los siguientes métodos:

- `getProfile(id: number)`: Obtiene un perfil por ID
- `getCurrentProfile()`: Obtiene el perfil del usuario autenticado
- `updateProfile(data)`: Actualiza el perfil actual
- `updateProfileById(id, data)`: Actualiza un perfil específico
- `uploadAvatar(file)`: Sube una imagen de avatar

**Uso ejemplo:**
```typescript
constructor(private profileService: Profile) {}

ngOnInit() {
  // Obtener perfil actual
  this.profileService.getCurrentProfile().subscribe({
    next: (profile) => console.log(profile),
    error: (err) => console.error(err)
  });
  
  // Actualizar perfil
  this.profileService.updateProfile({ 
    name: 'Nuevo Nombre',
    bio: 'Mi biografía' 
  }).subscribe({
    next: (updated) => console.log('Perfil actualizado', updated),
    error: (err) => console.error(err)
  });
}
```

### 3. Interceptor JWT (`src/app/auth.interceptor.ts`)

Ya configurado. Toma el token de `localStorage` y lo añade automáticamente:
```typescript
Authorization: Bearer <token>
```

### 4. Configuración App (`src/app/app.config.ts`)

Ya está registrado el HttpClient con el interceptor:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor])  // ✅ Interceptor registrado
    )
  ]
};
```

## 🔐 Autenticación

Para que el interceptor funcione, guarda el token después del login:
```typescript
// En tu componente de login, después de autenticarte:
localStorage.setItem('token', response.token);
```

Para cerrar sesión:
```typescript
localStorage.removeItem('token');
```

## 🚀 Endpoints Esperados en Ktor

El ProfileService espera estos endpoints en tu backend:

- `GET /api/profile/{id}` - Obtener perfil por ID
- `GET /api/profile/me` - Obtener perfil del usuario autenticado
- `PUT /api/profile` - Actualizar perfil actual
- `PUT /api/profile/{id}` - Actualizar perfil específico
- `POST /api/profile/avatar` - Subir avatar (FormData con campo "avatar")

**Nota:** Ajusta la ruta base en `profile.ts` si tus endpoints son diferentes.

## 📝 Configuración CORS en Ktor

Asegúrate de que tu backend Ktor tenga:

```kotlin
install(CORS) {
    allowHost("localhost:4200")
    allowHeader(HttpHeaders.Authorization)
    allowHeader(HttpHeaders.ContentType)
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Get)
    allowMethod(HttpMethod.Post)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Delete)
    allowCredentials = true
}
```

## ✅ Verificación

1. Backend Ktor corriendo en `http://localhost:8080` ✓
2. Frontend Angular corriendo en `http://localhost:4200` ✓
3. Token guardado en localStorage después del login ✓
4. Interceptor añade automáticamente el token a cada petición ✓

## 🛠️ Para ejecutar

```bash
# Frontend (Angular)
ng serve

# Backend (Ktor) - según tu configuración
./gradlew run
```
