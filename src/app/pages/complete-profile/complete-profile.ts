import {Component, signal, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router, ActivatedRoute} from '@angular/router';
import {finalize, switchMap, catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AdviserService, Specialty} from '../../core/services/adviser.service';
import {AuthService} from '../../core/services/auth.service';
import {environment} from '@env/environment';

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
  private readonly profileApiUrl = `${environment.apiUrl}${environment.endpoints.profile.me}`;
  // Endpoint para subir imagen y a la vez adjuntar
  private readonly uploadApiUrl = `${environment.apiUrl}${environment.endpoints.media.uploadAndAttach}`;

  private adviserService = inject(AdviserService);

  /** ====== Catálogos ====== */
    // Estados de la república
  estadosMx: Opcion[] = [
    {value: 'AGS', label: 'Aguascalientes'},
    {value: 'BC', label: 'Baja California'},
    {value: 'BCS', label: 'Baja California Sur'},
    {value: 'CAMP', label: 'Campeche'},
    {value: 'CHIS', label: 'Chiapas'},
    {value: 'CHIH', label: 'Chihuahua'},
    {value: 'CDMX', label: 'Ciudad de México'},
    {value: 'COAH', label: 'Coahuila'},
    {value: 'COL', label: 'Colima'},
    {value: 'DGO', label: 'Durango'},
    {value: 'GTO', label: 'Guanajuato'},
    {value: 'GRO', label: 'Guerrero'},
    {value: 'HGO', label: 'Hidalgo'},
    {value: 'JAL', label: 'Jalisco'},
    {value: 'MEX', label: 'Estado de México'},
    {value: 'MICH', label: 'Michoacán'},
    {value: 'MOR', label: 'Morelos'},
    {value: 'NAY', label: 'Nayarit'},
    {value: 'NL', label: 'Nuevo León'},
    {value: 'OAX', label: 'Oaxaca'},
    {value: 'PUE', label: 'Puebla'},
    {value: 'QRO', label: 'Querétaro'},
    {value: 'QROO', label: 'Quintana Roo'},
    {value: 'SLP', label: 'San Luis Potosí'},
    {value: 'SIN', label: 'Sinaloa'},
    {value: 'SON', label: 'Sonora'},
    {value: 'TAB', label: 'Tabasco'},
    {value: 'TAM', label: 'Tamaulipas'},
    {value: 'TLAX', label: 'Tlaxcala'},
    {value: 'VER', label: 'Veracruz'},
    {value: 'YUC', label: 'Yucatán'},
    {value: 'ZAC', label: 'Zacatecas'},
  ];

  // Niveles
  niveles: Opcion[] = [
    {value: 'Universidad', label: 'Universidad'},
    {value: 'Primaria', label: 'Primaria'},
    {value: 'Secundaria', label: 'Secundaria'},
    {value: 'Preparatoria', label: 'Preparatoria'},
    {value: 'Licenciatura', label: 'Licenciatura'},
    {value: 'Posgrado', label: 'Posgrado'},
    {value: 'Tesis', label: 'Tesis'},
    {value: 'Extracurricular', label: 'Extracurricular'},
    {value: 'Tecnico', label: 'Técnico'},
  ];

  // Especialidades (alineadas con la DB vía AdviserService)
  tagsDisponibles: Specialty[] = [];

  /** ====== Iconos de chips (si los usas en el template) ====== */
  private tagIcons: Record<string, string> = {
    'Ciencias exactas': '•',
    'Ciencias Naturales': '•',
    'Ciencias Sociales': '•',
    'Idiomas': '•',
    'Artes': '•',
    'Humanidades': '•',
    'Comunicación': '•',
    'Artes y Creatividad': '•',
    'Negocios': '•',
    'Economía': '•',
    'Soft Skills': '•',
    'Salud': '•',
    'Bienestar': '•',
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

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
  }

  /** ====== Helpers ====== */
  private parseApiError(err: any): ApiError | null {
    if (err?.error && typeof err.error === 'object' && 'code' in err.error && 'message' in err.error) {
      return err.error as ApiError;
    }
    if (typeof err?.error === 'string') {
      return {code: 'UNKNOWN', message: err.error};
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

  /** ====== Redireccion segun usuario====== */
  navigateAfterSave() {
    // Leemos un query param opcional: ?redirectTo=student o ?redirectTo=advisor
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');

    if (redirectTo === 'advisor') {
      this.router.navigate(['/panel-asesor']);
    } else if (redirectTo === 'student') {
      this.router.navigate(['/student-home']);
    } else {
      // Fallback por defecto (por si alguien entra directo a /complete-profile)
      this.router.navigate(['/student-home']);
    }
  }

  /** ====== Carga de catálogo de especialidades ====== */
  private loadSpecialties() {
    this.adviserService.getSpecialties().subscribe({
      next: (data) => {
        // Opcional: orden alfabético
        this.tagsDisponibles = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error cargando specialties para el perfil', err);
        this.tagsDisponibles = [];
      },
    });
  }

  /** ====== Ciclo de vida ====== */
  ngOnInit() {
    // 1) Cargar catálogo de especialidades (alineado a DB)
    this.loadSpecialties();

    // 2) Cargar perfil del usuario
    this.http
      .get<ProfileResponse>(this.profileApiUrl)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            // Estado esperado: usuario aún no tiene perfil
            const apiErr = this.parseApiError(error);
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

        // Tags seleccionados
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
            description: formValue.description ?? null,
            photoUrl: uploadedPhotoUrl ?? null,
            city: null,
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
          this.errorBanner.set(null);
          this.infoBanner.set(null);
          alert('¡Perfil guardado con éxito!');
          this.navigateAfterSave();   // 👈 AQUÍ en lugar de router.navigate fijo
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


  onCancel() {
    this.navigateAfterSave();
  }

}
