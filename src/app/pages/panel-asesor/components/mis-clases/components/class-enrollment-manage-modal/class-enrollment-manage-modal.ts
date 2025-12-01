import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';

import {
  ClassService,
  ClassEnrollmentResponse
} from '../../../../../../core/services/class.service';

import {
  ChatService,
  ChatConversation
} from '../../../../../../core/services/chat.service';

@Component({
  selector: 'app-class-enrollment-manage-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './class-enrollment-manage-modal.html',
  styleUrls: ['./class-enrollment-manage-modal.css']
})
export class ClassEnrollmentManageModalComponent implements OnInit {

  @Input() classId!: number;
  @Input() classTitle: string = '';
  @Output() close = new EventEmitter<void>();

  loading = false;

  // Alumnos ya inscritos en esta clase
  enrolled: ClassEnrollmentResponse[] = [];

  // Contactos con chat (alumnos aceptados)
  contacts: ChatConversation[] = [];
  contactsLoading = false;

  // Búsqueda por nombre
  searchTerm: string = '';

  // Inscripción
  enrolling = false;
  errorMessage: string | null = null;

  constructor(
    private classService: ClassService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    if (!this.classId) {
      console.warn('ClassEnrollmentManageModalComponent: classId no proporcionado');
      return;
    }
    this.loadEnrollments();
    this.loadContacts();
  }

  // ====== Enrollments de la clase ======
  private loadEnrollments(): void {
    this.loading = true;
    this.errorMessage = null;

    this.classService.getClassEnrollments(this.classId).subscribe({
      next: (data) => {
        this.enrolled = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando alumnos de la clase', err);
        this.errorMessage = 'No se pudieron cargar los alumnos inscritos.';
        this.loading = false;
      }
    });
  }

  // ====== Chats (contactos aceptados) ======
  private loadContacts(): void {
    this.contactsLoading = true;

    this.chatService.getMyChats().subscribe({
      next: (data: ChatConversation[]) => {
        this.contacts = data;
        this.contactsLoading = false;
      },
      error: (err) => {
        console.error('Error cargando chats del usuario', err);
        this.contactsLoading = false;
      }
    });
  }

  // Getter: contactos filtrados por nombre
  get filteredContacts(): ChatConversation[] {
    const term = (this.searchTerm || '').toLowerCase().trim();

    // Sin búsqueda: mostrar los 10 más recientes
    if (!term) {
      return this.contacts.slice(0, 10);
    }

    return this.contacts.filter(c =>
      c.studentName.toLowerCase().includes(term)
    );
  }

  // Saber si ya está inscrito en esta clase
  isAlreadyEnrolled(studentId: number): boolean {
    return this.enrolled.some(e => e.studentId === studentId);
  }

  // Inscribir desde la lista de contactos
  onEnrollFromContact(contact: ChatConversation): void {
    const studentId = contact.otherParticipantId;

    if (this.isAlreadyEnrolled(studentId)) {
      return;
    }

    this.enrolling = true;
    this.errorMessage = null;

    this.classService.enrollStudent(this.classId, studentId).subscribe({
      next: () => {
        this.enrolling = false;
        // recarga lista de inscritos para que se refleje arriba
        this.loadEnrollments();
      },
      error: (err) => {
        console.error('Error al inscribir alumno', err);
        this.errorMessage = err?.error || 'No se pudo inscribir al alumno.';
        this.enrolling = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
