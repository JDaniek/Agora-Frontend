// Importa lo necesario
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, [ngClass]
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { SidebarService } from '../../core/services/sidebar';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  
  // --- AÑADE ESTAS IMPORTACIONES ---
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule 
  ]
  // ---------------------------------

})
export class ChatComponent implements OnInit {

  // 2. Inyecta el servicio en el constructor
  constructor(private sidebarService: SidebarService) { }

  ngOnInit(): void {
    // 3. (Importante) Asegúrate de que el sidebar esté cerrado cuando entres al chat
    this.sidebarService.close();
  }

  // 4. Modifica 'toggleSidebar' para que llame al servicio
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // --- Datos de Ejemplo (Esto vendrá del backend/websocket) ---
  
  public chatList: any[] = [
    { 
      id: 1, 
      username: 'Alejandra Hernandez', 
      messageSnippet: 'Esta es una pequeña descripción...', 
      avatar: 'ruta/a/avatar_alejandra.png', // Reemplaza con rutas reales
      active: true 
    },
    { 
      id: 2, 
      username: 'Nombre Usuario', 
      messageSnippet: 'Sección de mensaje...', 
      avatar: 'ruta/a/avatar_usuario.png', 
      active: false 
    },
    { 
      id: 3, 
      username: 'Otro Usuario', 
      messageSnippet: 'Sección de mensaje...', 
      avatar: 'ruta/a/avatar_usuario2.png', 
      active: false 
    }
  ];

  public activeChatMessages: any[] = [
    { type: 'incoming', text: 'Esta es una pequeña descripción de lo que enseño y de algunos temas en especifico que domino a la perfección' },
    { type: 'outgoing', text: '¡Genial! Me parece perfecto.' },
    { type: 'outgoing', text: 'Justo eso estaba buscando.' }
  ];

  public newMessage: string = ''; // Variable para el input de mensaje
  // --- Funciones ---

  selectChat(chatId: number): void {
    console.log('Cambiando al chat:', chatId); // Para depurar

    // 1. Pone todos los chats como 'inactivos'
    this.chatList.forEach(chat => chat.active = false);
    
    // 2. Activa solo el chat seleccionado
    const selectedChat = this.chatList.find(chat => chat.id === chatId);
    if (selectedChat) {
      selectedChat.active = true;
    }

    // 3. (FUTURO) Aquí cargarías los mensajes de ese chat
    // Por ahora, solo simula que el chat activo cambia
    // this.activeChatMessages = this.loadMessagesForChat(chatId);
  }

  sendMessage(): void {
    const messageText = this.newMessage.trim();
    if (!messageText) return; 

    console.log('Enviando mensaje:', messageText); // Para depurar

    // 1. (Simulación) Añade el mensaje a la lista local como 'outgoing'
    this.activeChatMessages.push({ type: 'outgoing', text: messageText });

    // 2. (FUTURO) Aquí enviarías el mensaje a través del Websocket
    // this.websocketService.sendMessage(messageText);

    // 3. Limpia el input
    this.newMessage = '';
  }
}