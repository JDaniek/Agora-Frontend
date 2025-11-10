// Ruta sugerida: src/app/pages/complete-profile/complete-profile.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

type Opcion = { value: string; label: string };

/** ====== TIPOS (alineados al backend) ====== */
interface ProfileResponse {
  userId: number;
  description: string | null;
  photoUrl: string | null;
  city: string | null;
  stateCode: string | null;
  level: string | null;
  specialties: { id: number; name: string }[];
}

interface UpdateProfileRequest {
  description: string | null;     // ← nullables
  photoUrl: string | null;        // ← nullables
  city: string | null;            // ← nullables
  stateCode: string;
  level: string;
  specialtyIds: number[];
}

interface ApiError {
  code: string;
  message: string;
}

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.css'],
})
export class CompleteProfile implements OnInit {
  /** ====== URLs ====== */
  private profileApiUrl = 'http://localhost:8080/api/v1/profile';
  // Endpoint para subir imagen y a la vez adjuntar
  private uploadApiUrl = 'http://localhost:8080/api/v1/media/upload-and-attach';

  /** ====== Catálogos ====== */
  estadosMx: Opcion[] = [
    { value: 'CHIS', label: 'Chiapas' },
    { value: 'JAL', label: 'Jalisco' },
    // ...
  ];
  niveles: Opcion[] = [{ value: 'Universidad', label: 'Universidad' } /* ... */];
  tagsDisponibles: { id: number; name: string }[] = [
    { id: 1, name: 'Ciencias Naturales' },
    { id: 2, name: 'Idiomas' },
    // ...
  ];

  /** ====== Iconos de chips ====== */
  private tagIcons: Record<string, string> = {
    'Ciencias Naturales': '🌿',
    'Idiomas': '🗣️',
    'Artes': '🎨',
  };
  iconFor(tag: { id: number; name: string }): string {
    return this.tagIcons[tag.name] ?? '•';
  }

  /** ====== Estado (signals) ====== */
  selectedTags = signal<Set<number>>(new Set<number>());
  avatarPreview = signal<string | null>(null);
  uploadedPhotoUrl = signal<string | null>(null);
  avatarFile = signal<File | null>(null);
  isUploadingAvatar = signal(false);
  isSaving = signal(false);

  // Banners (no bloqueantes)
  infoBanner = signal<string | null>(null);
  errorBanner = signal<string | null>(null);

  /** ====== Formulario ====== */
  form = new FormGroup({
    stateCode: new FormControl<string | null>(null, Validators.required),
    level: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null),
  });

  constructor(private http: HttpClient, private router: Router) {}

  /** ====== Helpers ====== */
  private parseApiError(err: any): ApiError | null {
    if (err?.error && typeof err.error === 'object' && 'code' in err.error && 'message' in err.error) {
      return err.error as ApiError;
    }
    if (typeof err?.error === 'string') {
      return { code: 'UNKNOWN', message: err.error };
    }
    return null;
  }

  trackByTag = (_: number, item: { id: number; name: string }) => item.id;

  toggleTag(tag: { id: number; name: string }) {
    const next = new Set(this.selectedTags());
    next.has(tag.id) ? next.delete(tag.id) : next.add(tag.id);
    this.selectedTags.set(next);
  }

  isSelected(tag: { id: number; name: string }) {
    return this.selectedTags().has(tag.id);
  }

  /** ====== Ciclo de vida ====== */
  ngOnInit() {
    this.http
      .get<ProfileResponse>(this.profileApiUrl)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            const apiErr = this.parseApiError(error);
            // Estado esperado: usuario aún no tiene perfil
            this.infoBanner.set(
              'Aún no has creado tu perfil. Completa los campos y guarda para iniciarlo.'
            );
            return of(null); // mantenemos el form vacío
          }
          const apiErr = this.parseApiError(error);
          this.errorBanner.set(
            apiErr?.message ?? 'No se pudo cargar tu perfil. Inténtalo más tarde.'
          );
          return of(null);
        })
      )
      .subscribe((profile) => {
        if (!profile) return;

        // Rellenar formulario
        this.form.patchValue({
          stateCode: profile.stateCode ?? null,
          level: profile.level ?? null,
          description: profile.description ?? null,
        });

        // Avatar
        if (profile.photoUrl) {
          this.avatarPreview.set(profile.photoUrl);
          this.uploadedPhotoUrl.set(profile.photoUrl);
        }

        // Tags
        const tagIds = new Set(profile.specialties.map((s) => s.id));
        this.selectedTags.set(tagIds);
      });
  }

  /** ====== Avatar ====== */

  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.avatarFile.set(file);
    this.isUploadingAvatar.set(true);

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file); // ← nombre de campo correcto para el backend

    this.http
      .post<{ photoUrl: string }>(this.uploadApiUrl, formData) // ← tipo
      .pipe(finalize(() => this.isUploadingAvatar.set(false)))
      .subscribe({
        next: (response) => {
          this.uploadedPhotoUrl.set(response.photoUrl); // ← usa photoUrl
        },
        error: (err: any) => {
          console.error('Error al subir la foto', err);
          const apiErr = this.parseApiError(err);
          this.errorBanner.set(
            apiErr?.message ?? 'No se pudo subir la foto. Inténtalo de nuevo.'
          );
        },
      });
  }

  private uploadAvatar(): Observable<string | null> {
    const file = this.avatarFile();
    if (!file) {
      return of(this.uploadedPhotoUrl());
    }
    // Si quisieras subir aquí, lo harías y devolverías la URL.
    // En este flujo ya se subió en onAvatarChange, así que devolvemos la URL actual.
    return of(this.uploadedPhotoUrl());
  }

  /** ====== Guardar ====== */
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorBanner.set('Revisa los campos obligatorios.');
      return;
    }
    this.isSaving.set(true);

    const formValue = this.form.getRawValue();

    this.uploadAvatar()
      .pipe(
        switchMap((uploadedPhotoUrl: string | null) => {
          const payload: UpdateProfileRequest = {
            description: formValue.description ?? null, // null, no ""
            photoUrl: uploadedPhotoUrl ?? null,         // null si no hay
            city: null,                                  // aún no lo capturamos
            stateCode: formValue.stateCode ?? '',
            level: formValue.level ?? '',
            specialtyIds: Array.from(this.selectedTags()),
          };
          return this.http.put<ProfileResponse>(this.profileApiUrl, payload);
        }),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          // Limpia banners y navega
          this.errorBanner.set(null);
          this.infoBanner.set(null);
          alert('¡Perfil guardado con éxito!');
          this.router.navigate(['/student-home']);
        },
        error: (err: any) => {
          const apiErr = this.parseApiError(err);
          if (err.status === 400) {
            this.errorBanner.set(
              apiErr?.message ?? 'Datos inválidos. Revisa el formulario.'
            );
          } else if (err.status === 401) {
            this.errorBanner.set('Tu sesión expiró. Vuelve a iniciar sesión.');
            this.router.navigate(['/login']);
          } else if (err.status === 409 || err.status === 422) {
            this.errorBanner.set(
              apiErr?.message ?? 'Conflicto al guardar. Revisa la información.'
            );
          } else if (err.status === 404) {
            // No debería suceder con PUT upsert, pero por si acaso:
            this.errorBanner.set(
              apiErr?.message ?? 'El perfil no existe y no pudo crearse.'
            );
          } else {
            this.errorBanner.set(
              apiErr?.message ?? 'Error al guardar el perfil. Inténtalo de nuevo.'
            );
          }
          console.error('Error al guardar el perfil', err);
        },
      });
  }
}
