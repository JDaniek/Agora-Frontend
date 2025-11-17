// dashboard-asesor.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

/**
 * Interfaz para el resumen de estadísticas del asesor
 * Backend: GET /api/v1/advisers/stats
 */
interface AdviserStatsResponse {
  pendingRequests: number;
  activeChats: number;
  finishedChats: number;
  nextSession: string | null; // ISO string o null
}

/**
 * Interfaz para solicitudes pendientes
 * Backend: GET /api/v1/advisers/requests?status=PENDING
 */
interface PendingRequestResponse {
  requestId: number;
  studentId: number;
  studentName: string;
  studentPhotoUrl: string | null;
  subject: string;
  level: string;
  requestDate: string; // ISO string
  status: string;
}

interface PendingRequestView {
  id: number;
  studentId: number;
  studentName: string;
  avatarUrl: string | null;
  subject: string;
  level: string;
  requestDate: Date;
  formattedDate: string;
  status: string;
}

/**
 * Interfaz para hilos de chat
 * Backend: GET /api/v1/advisers/chats?filter=all|active|finished
 */
interface ChatThreadResponse {
  chatId: number;
  studentId: number;
  studentName: string;
  studentPhotoUrl: string | null;
  subject: string;
  level: string;
  lastMessage: string | null;
  lastMessageDate: string | null; // ISO string
  unreadCount: number;
  status: string; // 'active' | 'finished'
}

interface ChatThreadView {
  id: number;
  studentId: number;
  studentName: string;
  avatarUrl: string | null;
  initials: string;
  subject: string;
  level: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
}

/**
 * Interfaz para mensajes de chat
 * Backend: GET /api/v1/advisers/chats/{chatId}/messages
 */
interface ChatMessageResponse {
  messageId: number;
  senderId: number;
  senderType: 'student' | 'adviser';
  content: string;
  timestamp: string; // ISO string
}

interface ChatMessageView {
  id: number;
  isFromAdviser: boolean;
  content: string;
  time: string;
}

@Component({
  selector: 'app-dashboard-asesor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './dashboard-asesor.html',
  styleUrls: ['./dashboard-asesor.css'],
})
export class DashboardAsesor implements OnInit {
  isSidebarOpen = false;
  currentView: 'inicio' | 'chats' | 'favoritos' | 'solicitudes' = 'inicio';

  // Datos del asesor
  adviserName = '';
  adviserAvatarUrl: string | null = null;

  // Estadísticas
  stats = {
    pendingRequests: 0,
    activeChats: 0,
    finishedChats: 0,
    nextSession: 'Sin sesiones',
  };

  // Solicitudes pendientes
  pendingRequests: PendingRequestView[] = [];

  // Chats
  chatFilterForm: FormGroup;
  chatThreads: ChatThreadView[] = [];
  filteredChatThreads: ChatThreadView[] = [];
  selectedChatId: number | null = null;
  selectedChat: ChatThreadView | null = null;
  chatMessages: ChatMessageView[] = [];
  newMessageText = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.chatFilterForm = this.fb.group({
      search: [''],
      filter: ['all'], // all | active | finished
    });
  }

  ngOnInit() {
    this.loadAdviserInfo();
    this.loadStats();
    this.loadPendingRequests();
    this.loadChatThreads();

    // Escuchar cambios en filtros de chat
    this.chatFilterForm.valueChanges.subscribe(() => {
      this.filterChats();
    });
  }

  private loadAdviserInfo() {
    // Intentar leer de localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.adviserName = user.firstName || 'Asesor';
        this.adviserAvatarUrl = user.photoUrl || null;
      } catch {
        this.adviserName = 'Asesor';
      }
    } else {
      this.adviserName = 'Asesor';
    }
  }

  private loadStats() {
    /**
     * Backend: GET /api/v1/advisers/stats
     * Response: AdviserStatsResponse
     */
    // Mock data
    const mockStats: AdviserStatsResponse = {
      pendingRequests: 3,
      activeChats: 5,
      finishedChats: 12,
      nextSession: '2025-11-20T10:00:00Z',
    };

    this.stats = {
      pendingRequests: mockStats.pendingRequests,
      activeChats: mockStats.activeChats,
      finishedChats: mockStats.finishedChats,
      nextSession: mockStats.nextSession
        ? this.formatNextSession(mockStats.nextSession)
        : 'Sin sesiones',
    };
  }

  private loadPendingRequests() {
    /**
     * Backend: GET /api/v1/advisers/requests?status=PENDING
     * Response: PendingRequestResponse[]
     */
    // Mock data
    const mockRequests: PendingRequestResponse[] = [
      {
        requestId: 1,
        studentId: 101,
        studentName: 'Ana García',
        studentPhotoUrl: null,
        subject: 'Matemáticas',
        level: 'Universidad',
        requestDate: '2025-11-15T14:30:00Z',
        status: 'PENDING',
      },
      {
        requestId: 2,
        studentId: 102,
        studentName: 'Carlos Ruiz',
        studentPhotoUrl: null,
        subject: 'Física',
        level: 'Bachillerato',
        requestDate: '2025-11-16T09:15:00Z',
        status: 'PENDING',
      },
      {
        requestId: 3,
        studentId: 103,
        studentName: 'María López',
        studentPhotoUrl: null,
        subject: 'Química',
        level: 'Universidad',
        requestDate: '2025-11-16T11:00:00Z',
        status: 'PENDING',
      },
    ];

    this.pendingRequests = mockRequests.map((r) =>
      this.mapRequestToView(r)
    );
  }

  private loadChatThreads() {
    /**
     * Backend: GET /api/v1/advisers/chats
     * Response: ChatThreadResponse[]
     */
    // Mock data
    const mockChats: ChatThreadResponse[] = [
      {
        chatId: 1,
        studentId: 201,
        studentName: 'Pedro Martínez',
        studentPhotoUrl: null,
        subject: 'Cálculo',
        level: 'Universidad',
        lastMessage: 'Muchas gracias por la explicación',
        lastMessageDate: '2025-11-16T15:30:00Z',
        unreadCount: 2,
        status: 'active',
      },
      {
        chatId: 2,
        studentId: 202,
        studentName: 'Laura Sánchez',
        studentPhotoUrl: null,
        subject: 'Álgebra',
        level: 'Bachillerato',
        lastMessage: '¿Podemos agendar otra sesión?',
        lastMessageDate: '2025-11-16T12:00:00Z',
        unreadCount: 0,
        status: 'active',
      },
      {
        chatId: 3,
        studentId: 203,
        studentName: 'Jorge Hernández',
        studentPhotoUrl: null,
        subject: 'Geometría',
        level: 'Bachillerato',
        lastMessage: 'Perfecto, entendido',
        lastMessageDate: '2025-11-15T18:45:00Z',
        unreadCount: 0,
        status: 'finished',
      },
      {
        chatId: 4,
        studentId: 204,
        studentName: 'Sofía Torres',
        studentPhotoUrl: null,
        subject: 'Trigonometría',
        level: 'Universidad',
        lastMessage: 'Hola, tengo dudas con el ejercicio 5',
        lastMessageDate: '2025-11-16T10:20:00Z',
        unreadCount: 1,
        status: 'active',
      },
    ];

    this.chatThreads = mockChats.map((c) => this.mapChatThreadToView(c));
    this.filteredChatThreads = [...this.chatThreads];
  }

  private loadChatMessages(chatId: number) {
    /**
     * Backend: GET /api/v1/advisers/chats/{chatId}/messages
     * Response: ChatMessageResponse[]
     */
    // Mock data
    const mockMessages: ChatMessageResponse[] = [
      {
        messageId: 1,
        senderId: 201,
        senderType: 'student',
        content: 'Hola, tengo una duda sobre derivadas',
        timestamp: '2025-11-16T14:00:00Z',
      },
      {
        messageId: 2,
        senderId: 1,
        senderType: 'adviser',
        content: 'Claro, dime en qué te puedo ayudar',
        timestamp: '2025-11-16T14:05:00Z',
      },
      {
        messageId: 3,
        senderId: 201,
        senderType: 'student',
        content: 'No entiendo la regla de la cadena',
        timestamp: '2025-11-16T14:10:00Z',
      },
      {
        messageId: 4,
        senderId: 1,
        senderType: 'adviser',
        content:
          'Te explico: la regla de la cadena se usa cuando tienes una función compuesta...',
        timestamp: '2025-11-16T14:15:00Z',
      },
      {
        messageId: 5,
        senderId: 201,
        senderType: 'student',
        content: 'Muchas gracias por la explicación',
        timestamp: '2025-11-16T15:30:00Z',
      },
    ];

    this.chatMessages = mockMessages.map((m) => this.mapMessageToView(m));
  }

  // Mappers
  private mapRequestToView(req: PendingRequestResponse): PendingRequestView {
    const date = new Date(req.requestDate);
    return {
      id: req.requestId,
      studentId: req.studentId,
      studentName: req.studentName,
      avatarUrl: req.studentPhotoUrl,
      subject: req.subject,
      level: req.level,
      requestDate: date,
      formattedDate: this.formatRequestDate(date),
      status: req.status,
    };
  }

  private mapChatThreadToView(chat: ChatThreadResponse): ChatThreadView {
    return {
      id: chat.chatId,
      studentId: chat.studentId,
      studentName: chat.studentName,
      avatarUrl: chat.studentPhotoUrl,
      initials: this.getInitials(chat.studentName),
      subject: chat.subject,
      level: chat.level,
      lastMessage: chat.lastMessage || 'Sin mensajes',
      lastMessageTime: chat.lastMessageDate
        ? this.formatChatTime(chat.lastMessageDate)
        : '',
      unreadCount: chat.unreadCount,
      status: chat.status,
    };
  }

  private mapMessageToView(msg: ChatMessageResponse): ChatMessageView {
    return {
      id: msg.messageId,
      isFromAdviser: msg.senderType === 'adviser',
      content: msg.content,
      time: this.formatMessageTime(msg.timestamp),
    };
  }

  // Utilidades de formato
  private formatNextSession(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'short' });
    return `${day} ${month}`;
  }

  private formatRequestDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'short' });
    return `${day} ${month}`;
  }

  private formatChatTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }

  private formatMessageTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Navegación
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  setView(view: 'inicio' | 'chats' | 'favoritos' | 'solicitudes') {
    this.currentView = view;
    this.closeSidebar();
  }

  // Acciones de solicitudes
  viewRequestDetail(request: PendingRequestView) {
    /**
     * Backend: GET /api/v1/advisers/requests/{requestId}
     * Navegar a vista detalle o abrir modal
     */
    console.log('Ver detalle de solicitud:', request);
  }

  acceptRequest(request: PendingRequestView) {
    /**
     * Backend: POST /api/v1/advisers/requests/{requestId}/accept
     * Body: { adviserId: number }
     */
    console.log('Aceptar solicitud:', request);
    // Después de aceptar, recargar pendingRequests
  }

  // Acciones de chat
  filterChats() {
    const { search, filter } = this.chatFilterForm.value;
    let filtered = [...this.chatThreads];

    // Filtro por estado
    if (filter === 'active') {
      filtered = filtered.filter((c) => c.status === 'active');
    } else if (filter === 'finished') {
      filtered = filtered.filter((c) => c.status === 'finished');
    }

    // Búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.studentName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredChatThreads = filtered;
  }

  selectChat(chat: ChatThreadView) {
    this.selectedChatId = chat.id;
    this.selectedChat = chat;
    this.loadChatMessages(chat.id);

    // Marcar mensajes como leídos
    if (chat.unreadCount > 0) {
      /**
       * Backend: POST /api/v1/advisers/chats/{chatId}/mark-read
       */
      chat.unreadCount = 0;
    }
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedChatId) return;

    /**
     * Backend: POST /api/v1/advisers/chats/{chatId}/messages
     * Body: { content: string }
     */
    const newMessage: ChatMessageView = {
      id: Date.now(),
      isFromAdviser: true,
      content: this.newMessageText,
      time: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.chatMessages.push(newMessage);
    this.newMessageText = '';

    // Actualizar último mensaje en thread
    if (this.selectedChat) {
      this.selectedChat.lastMessage = newMessage.content;
      this.selectedChat.lastMessageTime = 'Ahora';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // TrackBy
  trackById(_i: number, item: any): number {
    return item.id;
  }
}
