export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register'
    },
    profile: {
      me: '/profile'
    },
    media: {
      upload: '/media/upload',
      uploadAndAttach: '/media/upload-and-attach'
    },
    advisers: {
      list: '/advisers',
      contact: '/advisers/:id/contact'
    },
    notifications: {
      mine: '/notifications',
      update: '/notifications/:id'
    },
    classes: {
      root: '/classes',
      mine: '/classes/mine',                  // Mis clases (como Profesor)
      enrolledMine: '/classes/enrolled/mine', // Mis clases (como Alumno)
      byId: '/classes/:id',
      enrollmentsByClass: '/classes/:id/enrollments',

      //NUEVO: Clases de un profesor específico (Público)
      byTutor: '/classes/teachers/:tutorId'
    },
    chat: {
      messagesByConversation: '/chat/:id/messages',
      websocket: '/ws/chat/:id',

      // NUEVO: Lista de mis chats (Para el sidebar de mensajería)
      mine: '/chats/mine'
    },
    reviews: {
      teacher: {
        list: '/reviews/teachers/:teacherId',
        summary: '/reviews/teachers/:teacherId/summary',
        create: '/reviews/teachers/:teacherId'          // POST autenticado
      },
      student: {
        list: '/reviews/students/:studentId',
        summary: '/reviews/students/:studentId/summary',
        mine: '/reviews/students/mine',
        mineSummary: '/reviews/students/mine/summary',
        mineLatest: '/reviews/students/mine/latest'
      },
      mine: '/reviews/mine'
    }
  }
};
