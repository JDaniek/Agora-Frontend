import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { ClassService, ClassResponse } from '../../core/services/class.service';
import { NotificationService, NotificationDto } from '../../core/services/notification.service';
import { ProfileService, ProfileResponse, UpdateProfileRequest } from '../../core/services/profile.service';

// Interfaces Visuales
interface ReceivedRequest {
  id: number;
  studentName: string;
  subject: string;
  requestDate: string;
  message: string;
  status: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
}

interface AdvisorSession {
  id: number;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  modality: string;
}

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-asesor.html',
  styleUrls: ['./panel-asesor.css']
})
export class PanelAsesorComponent implements OnInit {

  // Datos del Panel
  receivedRequests: ReceivedRequest[] = [];
  upcomingSessions: AdvisorSession[] = [];

  // Datos del Perfil (Conectados al Backend)
  advisorProfile = {
    name: '',       // Vendrá del LocalStorage
    description: '', // Vendrá del backend (campo description)
    level: '',      // Vendrá del backend
    stateCode: '',  // Vendrá del backend
    specialties: [] as { id: number, name: string }[] // Guardamos objetos completos
  };

  // Input para editar materias (separadas por comas)
  subjectsInput: string = '';
  
  // Flag para feedback visual
  profileSaved = false;

  constructor(
    private classService: ClassService,
    private notificationService: NotificationService,
    private profileService: ProfileService // Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.loadUserData();     // Cargar nombre
    this.loadProfile();      // Cargar datos del perfil (API)
    this.loadNotifications();
    this.loadMyClasses();
  }

  // 1. Cargar nombre del usuario (LocalStorage)
  loadUserData() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      // Asumimos que guardaste firstName/lastName al hacer login
      this.advisorProfile.name = `${user.firstName} ${user.lastName || ''}`.trim();
    }
  }

  // 2. Cargar Perfil desde API (GET /profile)
  loadProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (profile: ProfileResponse) => {
        this.advisorProfile.description = profile.description || '';
        this.advisorProfile.level = profile.level || 'Universidad'; // Default si es null
        this.advisorProfile.stateCode = profile.stateCode || 'MX';
        this.advisorProfile.specialties = profile.specialties;

        // Convertimos las especialidades a texto para el input visual
        this.subjectsInput = profile.specialties.map(s => s.name).join(', ');
      },
      error: (err) => console.error('Error cargando perfil', err)
    });
  }

  // 3. Guardar Perfil (PUT /profile)
  saveProfile(): void {
    /* NOTA IMPORTANTE: 
       El backend espera IDs de especialidades. 
       Como el input es de texto libre, aquí hay un reto:
       No podemos "inventar" IDs para texto nuevo sin un endpoint de 'crear especialidad'.
       
       Para que funcione AHORA sin romper nada: 
       Enviaremos los mismos IDs que ya teníamos descargados.
       (La edición real de especialidades requeriría un selector/dropdown de IDs).
    */
    
    const payload: UpdateProfileRequest = {
      description: this.advisorProfile.description,
      level: this.advisorProfile.level,
      stateCode: this.advisorProfile.stateCode,
      // Mapeamos los objetos actuales a solo sus IDs
      specialtyIds: this.advisorProfile.specialties.map(s => s.id) 
    };

    this.profileService.updateMyProfile(payload).subscribe({
      next: (updatedProfile) => {
        this.profileSaved = true;
        // Actualizamos la vista con lo que confirmó el servidor
        this.advisorProfile.description = updatedProfile.description || '';
        
        // Ocultar mensaje de "Guardado" después de 3 segundos
        setTimeout(() => this.profileSaved = false, 3000);
      },
      error: (err) => {
        console.error('Error guardando perfil', err);
        alert('Error al guardar cambios');
      }
    });
  }

  // --- (El resto de tus métodos: loadNotifications, loadMyClasses, etc. siguen igual) ---
  
  loadNotifications() {
    this.notificationService.getMyNotifications('pending').subscribe({
      next: (dtos) => {
        this.receivedRequests = dtos.map(dto => ({
          id: dto.notificationId,
          studentName: `${dto.senderFirstName || 'Usuario'} ${dto.senderLastName || ''}`.trim(),
          subject: 'Solicitud de contacto',
          requestDate: new Date(dto.createdAt).toLocaleDateString(),
          message: 'Quiere contactar contigo',
          status: 'PENDIENTE'
        }));
      },
      error: (err) => console.error(err)
    });
  }

  loadMyClasses() {
    this.classService.getMyClassesTutor().subscribe({
      next: (classes) => {
        this.upcomingSessions = classes.map(c => ({
          id: c.id,
          studentName: 'Ver inscritos',
          subject: c.title,
          date: c.classDate,
          time: '10:00',
          modality: 'En línea'
        }));
      },
      error: (err) => console.error(err)
    });
  }

  acceptRequest(request: ReceivedRequest): void {
    if (request.status !== 'PENDIENTE') return;
    this.notificationService.acceptRequest(request.id).subscribe({
      next: () => {
        request.status = 'ACEPTADA';
        alert('Solicitud aceptada. Chat creado.');
      },
      error: () => alert('Error al aceptar')
    });
  }

  rejectRequest(request: ReceivedRequest): void {
    if (request.status !== 'PENDIENTE') return;
    this.notificationService.declineRequest(request.id).subscribe({
      next: () => request.status = 'RECHAZADA',
      error: () => alert('Error al rechazar')
    });
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}