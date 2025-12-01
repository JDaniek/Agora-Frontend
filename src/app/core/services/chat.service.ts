import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, Subject} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {map} from 'rxjs/operators';

export interface ChatMessage {
  id?: number;
  chatId: number;
  senderId: number;
  content: string;
  timestamp: string;
  isMine?: boolean; // Para saber si lo pinto a la derecha o izquierda
}

export interface ChatConversation {
  id: number;
  studentName: string;              // Nombre del otro participante
  studentAvatar?: string | null;    // Avatar del otro participante
  lastMessage?: string;
  unreadCount?: number;
  otherParticipantId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl;

  // Guardamos la conexión activa
  private socket$!: WebSocketSubject<any>;
  public messagesSubject = new Subject<ChatMessage>();

  constructor(private http: HttpClient) {
  }

  /**
   * 0. Obtener lista de mis chats (REAL)
   * GET /api/v1/chats/mine
   */
  getMyChats(): Observable<ChatConversation[]> {
    const url = `${this.apiUrl}${environment.endpoints.chat.mine}`;

    return this.http.get<any[]>(url).pipe(
      map(response =>
        response.map(chat => ({
          id: chat.chatId,
          //NUEVO: guardamos el ID real del alumno
          otherParticipantId: chat.otherParticipantId,
          // Mapeamos lo que viene del backend a lo que espera tu vista
          studentName: chat.otherParticipantName || 'Usuario',
          studentAvatar: chat.otherParticipantPhoto ?? null,
          lastMessage: chat.lastMessage || 'Nuevo chat',
          unreadCount: chat.unreadCount || 0
        }) as ChatConversation)
      )
    );
  }

  // 1. Obtener historial de mensajes (HTTP)
  getChatMessages(chatId: number): Observable<ChatMessage[]> {
    const url = `${this.apiUrl}/chat/${chatId}/messages`;

    return this.http.get<any[]>(url).pipe(
      map(msgs =>
        msgs.map(m => {
          return {
            id: m.id ?? m.messageId ?? 0,
            chatId: m.chatId,
            senderId: m.senderId,
            // Intentamos leer 'content', si no existe, 'body', si no, 'message'
            content: m.content || m.body || m.message || '',
            timestamp: m.timestamp || m.sentAt || new Date().toISOString(),
            isMine: this.isMessageMine(m.senderId)
          } as ChatMessage;
        })
      )
    );
  }

  // 2. Conectar WebSocket
  connectToChat(chatId: number) {
    // Recuperamos el token para enviarlo (Manual, ya que no hay interceptor en WS)
    const token = localStorage.getItem('token');

    const wsBaseUrl = this.apiUrl.replace('http', 'ws');
    const url = `${wsBaseUrl}/ws/chat/${chatId}?token=${token}`;

    console.log('🔌 Conectando WS a:', url);

    // Si ya había una conexión, la cerramos
    if (this.socket$) {
      this.socket$.complete();
    }

    this.socket$ = webSocket(url);

    this.socket$.subscribe({
      next: (msg) => {
        console.log('📩 Mensaje recibido WS:', msg);
        // Normalizamos igual que en HTTP
        const parsedMsg: ChatMessage = {
          id: msg.id ?? msg.messageId ?? 0,
          chatId: msg.chatId,
          senderId: msg.senderId,
          content: msg.content || msg.body || msg.message || '',
          timestamp: msg.timestamp || msg.sentAt || new Date().toISOString(),
          isMine: this.isMessageMine(msg.senderId)
        };
        this.messagesSubject.next(parsedMsg);
      },
      error: (err) => console.error('🔴 Error WS:', err),
      complete: () => console.log('🔌 Conexión cerrada')
    });
  }

  // 3. Enviar mensaje
  sendMessage(content: string, chatId: number, senderId: number) {
    if (this.socket$) {
      // Payload para el servidor (Ktor espera solo 'body')
      const serverPayload = {
        body: content
      };

      console.log('📤 Enviando WS:', serverPayload);
      this.socket$.next(serverPayload);

      // (Opcional) actualización optimista -> comentada por ahora
      /*
      const localMessage: ChatMessage = {
        chatId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        isMine: true
      };
      this.messagesSubject.next(localMessage);
      */
    } else {
      console.error('No hay conexión WS activa');
    }
  }

  disconnect() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  // Helper para saber si el mensaje es mío
  private isMessageMine(senderId: number): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const myId = JSON.parse(userStr).id;
    return senderId === myId;
  }
}
