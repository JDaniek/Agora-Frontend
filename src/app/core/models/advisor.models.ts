export interface NotificationRequest {
  id: number;
  userId: number; // El dueño de la notificacion
  title: string;
  message: string;
  type: string; // 'CONTACT_REQUEST', 'SYSTEM', etc.
  status: 'pending' | 'accepted' | 'declined' | 'read' | 'unread';
  createdAt: string;

  // Datos del remitente (el alumno).
  // Si vienen en una propiedad llamada 'sender' o 'triggeredBy':
  sender?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    level?: string;
  };
}
