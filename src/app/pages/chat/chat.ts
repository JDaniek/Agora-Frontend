import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Msg = { from: 'me' | 'other'; text: string; at: Date };

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat {
  messages: Msg[] = [
    { from: 'other', text: 'Hola, ¿en qué puedo ayudarte?', at: new Date() },
    { from: 'me', text: 'Quiero clases de matemáticas básicas.', at: new Date() },
  ];
  draft = '';

  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.push({ from: 'me', text, at: new Date() });
    this.draft = '';
    // 🔌 TODO: POST /api/messages o WebSocket
  }
}

