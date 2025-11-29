import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatConversation } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-chats.component.html',
  styleUrls: ['./student-chats.component.css']
})
export class StudentChatsComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Lista de chats (Aquí serán los asesores)
  chatsList: ChatConversation[] = [];
  selectedChatId: number | null = null;
  selectedChatName: string = '';

  messages: ChatMessage[] = [];
  newMessageText: string = '';

  private msgSubscription!: Subscription;
  myUserId: number = 0;

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) this.myUserId = JSON.parse(userStr).id;

    // 1. Cargar MOCK de asesores con los que tengo chat
    this.loadAdvisorsMock();

    // 2. Suscribirse al canal global de mensajes
    this.msgSubscription = this.chatService.messagesSubject.subscribe(msg => {
      if (this.selectedChatId === msg.chatId) {
        this.messages.push(msg);
        this.cd.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    if (this.msgSubscription) this.msgSubscription.unsubscribe();
  }

  loadAdvisorsMock() {
    // TODO: En el futuro esto vendrá de GET /api/v1/chats/mine
    // Nótese que aquí ponemos nombres de ASESORES
    this.chatsList = [
      { id: 2, studentName: 'Profe Pedro (Matemáticas)', lastMessage: 'Nos vemos en clase', unreadCount: 0 },
      { id: 5, studentName: 'Dra. Ana (Física)', lastMessage: 'Hola', unreadCount: 2 }
    ];
  }

  selectChat(chat: ChatConversation) {
    if (this.selectedChatId === chat.id) return;

    this.selectedChatId = chat.id;
    this.selectedChatName = chat.studentName;
    this.messages = [];

    // Cargar Historial
    this.chatService.getChatMessages(chat.id).subscribe({
      next: (historial) => {
        console.log('📥 [Alumno] Historial:', historial);
        this.messages = historial;
        this.cd.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => console.error(err)
    });

    // Conectar WebSocket
    this.chatService.connectToChat(chat.id);
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedChatId) return;

    this.chatService.sendMessage(this.newMessageText, this.selectedChatId, this.myUserId);
    this.newMessageText = '';
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
