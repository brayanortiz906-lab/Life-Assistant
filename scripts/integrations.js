// Sistema de Integraciones Centralizado
const IntegrationSystem = {
  services: {
    google: { connected: false, name: 'Google Workspace', icon: '🌐' },
    classroom: { connected: false, name: 'Google Classroom', icon: '🎓' },
    gmail: { connected: false, name: 'Gmail', icon: '✉️' },
    calendar: { connected: false, name: 'Google Calendar', icon: '📅' },
    github: { connected: false, name: 'GitHub', icon: '🐙' }
  },

  async init() {
    console.log('🔗 IntegrationSystem inicializado');
    this.checkConnections();
  },

  async checkConnections() {
    // Verificar si hay tokens en settings
    if (typeof SettingsSystem !== 'undefined') {
      const config = SettingsSystem.config;
      this.services.google.connected = config.googleConnected;
      this.services.github.connected = config.githubConnected;
    }
  },

  // Calendario: Obtener eventos
  async getCalendarEvents() {
    if (!this.services.calendar.connected) return { error: 'No conectado a Google Calendar' };
    // Simulación de fetch a API
    return [
      { title: 'Reunión Proyecto', time: '10:00', type: 'work' },
      { title: 'Clase Prompt Engineering', time: '14:00', type: 'study' }
    ];
  },

  // Classroom: Obtener tareas
  async getClassroomTasks() {
    if (!this.services.classroom.connected) return { error: 'No conectado a Classroom' };
    return [
      { title: 'Entrega Final Prompt Engineering', dueDate: '2026-10-30' },
      { title: 'Quiz Teoría IA', dueDate: '2026-11-05' }
    ];
  },

  // Gmail: Obtener emails importantes
  async getImportantEmails() {
    if (!this.services.gmail.connected) return { error: 'No conectado a Gmail' };
    return [
      { from: 'profesor@uni.edu', subject: 'Feedback Tarea 1', snippet: 'Muy buen trabajo...' },
      { from: 'github@notifications.com', subject: 'PR Merged', snippet: 'Tu pull request fue aprobado' }
    ];
  },

  // GitHub: Obtener issues/PRs
  async getGitHubActivity() {
    if (!this.services.github.connected) return { error: 'No conectado a GitHub' };
    return [
      { repo: 'Life-Assistant', type: 'PR', title: 'Fix: Animations' },
      { repo: 'Life-Assistant', type: 'Issue', title: 'Refactor Chat' }
    ];
  }
};

window.IntegrationSystem = IntegrationSystem;
IntegrationSystem.init();
