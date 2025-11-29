import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
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

  // Lista de chats (asesores con los que el alumno tiene chat)
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

    // 1. Cargar lista real de chats del alumno
    this.loadMyChats();

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

  // 🚀 Nuevo: cargar chats reales del backend
  loadMyChats() {
    this.chatService.getMyChats().subscribe({
      next: (chats) => {
        console.log('✅ [Alumno] Chats cargados:', chats);
        this.chatsList = chats;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error cargando chats del alumno', err)
    });
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
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
