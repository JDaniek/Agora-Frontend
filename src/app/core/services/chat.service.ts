import {Injectable, inject} from '@angular/core';
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
  studentName: string;
  studentAvatar?: string;
  lastMessage?: string;
  unreadCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Guardamos la conexión activa
  private socket$!: WebSocketSubject<any>;
  public messagesSubject = new Subject<ChatMessage>();

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

    // Suponiendo que 'token' es solo el hash (eyJh...):
    const wsBaseUrl = this.apiUrl.replace('http', 'ws');
    // Importante: Enviamos el parametro 'token' que Ktor ahora sabe leer
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
        // Normalizamos el contenido igual que en HTTP
        const parsedMsg: ChatMessage = {
          ...msg,
          content: msg.content || msg.body || msg.message || '',
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

      // 1. Payload para el Servidor (Lo que Ktor espera)
      // Ktor es estricto: Solo enviamos 'body'.
      // El senderId lo saca del Token y el chatId de la URL.
      const serverPayload = {
        body: content
      };

      console.log('📤 Enviando WS:', serverPayload);
      this.socket$.next(serverPayload);

      // 2. (Opcional) Actualización Optimista Local
      // Como quitamos los datos del payload, si quieres ver el mensaje
      // inmediatamente en tu pantalla antes de que el servidor responda:
      /*
      const localMessage: ChatMessage = {
        chatId: chatId,
        senderId: senderId,
        content: content,
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
