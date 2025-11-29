import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatConversation } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-chats.component.html',
  styleUrls: ['./mis-chats.component.css']
})
export class MisChatsComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private cd = inject(ChangeDetectorRef); // <--- INYECTAR ChangeDetectorRef

  // Referencia al contenedor de mensajes para hacer scroll automático
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Estado
  chatsList: ChatConversation[] = []; // Lista de la izquierda
  selectedChatId: number | null = null;
  selectedChatName: string = '';

  messages: ChatMessage[] = [];
  newMessageText: string = '';

  private msgSubscription!: Subscription;
  myUserId: number = 0;

  ngOnInit() {
    // 1. Obtener mi ID
    const userStr = localStorage.getItem('user');
    if (userStr) this.myUserId = JSON.parse(userStr).id;

    // 2. Cargar lista de chats (Mock por ahora, hasta tener endpoint GET /chats)
    this.loadMyChatsMock();

    // 3. Suscribirse a mensajes entrantes del socket
    this.msgSubscription = this.chatService.messagesSubject.subscribe(msg => {
      // Solo agregamos si pertenece al chat abierto
      if (this.selectedChatId === msg.chatId) {
        this.messages.push(msg);
        this.cd.detectChanges(); // <--- Forzar actualización al recibir mensaje
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewChecked() {
    // Scroll al fondo cada vez que cambia la vista (mensajes nuevos)
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    if (this.msgSubscription) this.msgSubscription.unsubscribe();
  }

  // Carga simulada de conversaciones (Izquierda)
  loadMyChatsMock() {
    // TODO: Reemplazar con endpoint real GET /chats
    this.chatsList = [
      { id: 2, studentName: 'Juan Alumno', lastMessage: 'Hola profe', unreadCount: 1 },
      { id: 99, studentName: 'Maria Perez', lastMessage: 'Gracias', unreadCount: 0 }
    ];
  }

  selectChat(chat: ChatConversation) {
    if (this.selectedChatId === chat.id) return;

    this.selectedChatId = chat.id;
    this.selectedChatName = chat.studentName;
    this.messages = []; // Limpiar vista previa

    // 1. Cargar historial HTTP
    this.chatService.getChatMessages(chat.id).subscribe({
      next: (historial) => {
        console.log('📥 Historial recibido (RAW):', historial); // Log crítico
        this.messages = historial;
        this.cd.detectChanges(); // <--- Forzar actualización tras carga HTTP
        this.scrollToBottom();
      },
      error: (err) => console.error(err)
    });

    // 2. Conectar WS
    this.chatService.connectToChat(chat.id);
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedChatId) return;

    // Enviamos por WS
    this.chatService.sendMessage(this.newMessageText, this.selectedChatId, this.myUserId);

    // Limpia el input
    this.newMessageText = '';
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
