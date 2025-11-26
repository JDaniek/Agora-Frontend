export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register'
    },
    profile: {
      me: '/profile' // GET/PUT
    },
    media: {
      upload: '/media/upload',
      uploadAndAttach: '/media/upload-and-attach'
    },
    advisers: {
      list: '/advisers',                // GET
      contact: '/advisers/:id/contact'  // POST (reemplazar :id)
    },
    notifications: {
      mine: '/notifications',           // GET
      update: '/notifications/:id'      // PATCH
    },
    classes: {
      root: '/classes',                     // POST (crear)
      mine: '/classes/mine',                // GET – mis clases (asesor)
      enrolledMine: '/classes/enrolled/mine', // GET – mis clases como alumno
      byId: '/classes/:id',                 // PATCH, DELETE
      enrollmentsByClass: '/classes/:id/enrollments' // GET, POST
    },
    chat: {
      messagesByConversation: '/chat/:id/messages', // GET
      websocket: '/ws/chat/:id'                     // WebSocket
    },
    reviews: {
      teacher: {
        list: '/reviews/teachers/:teacherId',           // GET público
        summary: '/reviews/teachers/:teacherId/summary' // GET público
      },
      student: {
        list: '/reviews/students/:studentId',           // GET público
        summary: '/reviews/students/:studentId/summary',// GET público
        mine: '/reviews/students/mine',                 // GET autenticado
        mineSummary: '/reviews/students/mine/summary',  // GET autenticado
        mineLatest: '/reviews/students/mine/latest'     // GET autenticado
      },
      mine: '/reviews/mine' // GET autenticado (reseñas del asesor)
    }
  }
};
