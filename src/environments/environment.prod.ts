export const environment = {
  production: true,
  apiUrl: 'https://api.mi-agora.com/api/v1', // ajústalo a tu dominio/host
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
      mine: '/classes/mine',
      enrolledMine: '/classes/enrolled/mine',
      byId: '/classes/:id',
      enrollmentsByClass: '/classes/:id/enrollments'
    },
    chat: {
      messagesByConversation: '/chat/:id/messages',
      websocket: '/ws/chat/:id'
    },
    reviews: {
      teacher: {
        list: '/reviews/teachers/:teacherId',
        summary: '/reviews/teachers/:teacherId/summary'
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
