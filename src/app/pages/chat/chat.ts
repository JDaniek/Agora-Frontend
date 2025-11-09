import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat', // Este es el 'nombre' del componente para el HTML
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit {

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

  constructor() { }

  ngOnInit(): void {
    // En un futuro, aquí es donde te conectarías al servicio del Websocket
    // para recibir la lista de chats y los mensajes.
  }

  // --- Funciones ---

  /**
   * Esta función se llamará cuando el usuario haga clic 
   * en un chat diferente de la lista.
   */
  selectChat(chatId: number): void {
    // 1. Pone todos los chats como 'inactivos'
    this.chatList.forEach(chat => chat.active = false);
    
    // 2. Activa solo el chat seleccionado
    const selectedChat = this.chatList.find(chat => chat.id === chatId);
    if (selectedChat) {
      selectedChat.active = true;
    }

    // 3. (FUTURO) Aquí cargarías los mensajes de ese chat
    // this.loadMessagesForChat(chatId);
    console.log('Chat seleccionado:', chatId);
  }

  /**
   * Esta función se llamará al presionar el botón de enviar
   */
  sendMessage(): void {
    const messageText = this.newMessage.trim();
    if (!messageText) return; // No enviar mensajes vacíos

    // 1. (Simulación) Añade el mensaje a la lista local como 'outgoing'
    this.activeChatMessages.push({ type: 'outgoing', text: messageText });

    // 2. (FUTURO) Aquí enviarías el mensaje a través del Websocket
    // this.websocketService.sendMessage(messageText);

    // 3. Limpia el input
    this.newMessage = '';
    
    // (Falta lógica para hacer scroll automático al final)
  }
}