// Chat Flotante Inteligente - Sistema Principal
const ChatFloater = {
  // Configuración
  config: {
    apiKey: null, // Para conexión a API personal
    usePersonalAI: true,
    floating: true,
    draggable: true,
    minimizable: true
  },

  // Estado
  state: {
    isOpen: false,
    isMinimized: false,
    position: { x: 20, y: window.innerHeight - 120 },
    messages: [],
    inputValue: ''
  },

  // Inicialización
  init() {
    this.createElements();
    this.bindEvents();
    this.loadHistory();
    this.render();
    console.log('✅ Chat Floater inicializado');
  },

  // Crear elementos DOM
  createElements() {
    // Contenedor flotante
    this.container = document.createElement('div');
    this.container.id = 'chat-floater-container';
    this.container.className = 'chat-floater-container';
    this.container.innerHTML = `
      <div class="chat-floater-window" id="chat-floater-window">
        <div class="chat-floater-header">
          <div class="chat-floater-title">
            <span class="chat-icon">💬</span>
            <span>Asistente IA</span>
            <span class="chat-status">en línea</span>
          </div>
          <div class="chat-floater-controls">
            <button id="chat-minimize" class="chat-control">−</button>
            <button id="chat-close" class="chat-control">✕</button>
          </div>
        </div>
        <div class="chat-floater-messages" id="chat-messages"></div>
        <form class="chat-floater-input" id="chat-input-form">
          <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." autocomplete="off">
          <button type="submit">➤</button>
        </form>
      </div>
      <button class="chat-floater-toggle" id="chat-toggle">💬</button>
    `;
    document.body.appendChild(this.container);
    this.addStyles();
  },

  // Agregar estilos CSS
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .chat-floater-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99999;
        pointer-events: none;
        font-family: 'Inter', sans-serif;
      }
      
      .chat-floater-window {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 360px;
        height: 480px;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: chatSlideIn 0.3s ease;
        margin: 0;
      }
      
      @keyframes chatSlideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .chat-floater-window.minimized {
        height: 52px;
        overflow: hidden;
      }
      
      .chat-floater-header {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.2));
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      
      .chat-floater-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .chat-icon {
        font-size: 18px;
      }
      
      .chat-status {
        font-size: 10px;
        color: #22c55e;
        margin-left: 8px;
      }
      
      .chat-floater-controls {
        display: flex;
        gap: 8px;
      }
      
      .chat-control {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 16px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .chat-control:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      
      .chat-floater-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .chat-message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .chat-message.user {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.3));
        border: 1px solid rgba(99, 102, 241, 0.4);
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      
      .chat-message.bot {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      
      .chat-floater-input {
        display: flex;
        padding: 12px;
        gap: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.3);
      }
      
      .chat-floater-input input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
        color: white;
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .chat-floater-input input:focus {
        border-color: rgba(99, 102, 241, 0.5);
      }
      
      .chat-floater-input button {
        background: var(--accent, #c6f24e);
        color: #000;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      
      .chat-floater-input button:hover {
        opacity: 0.9;
      }
      
      .chat-floater-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        pointer-events: all;
      }
      
      .chat-floater-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(99, 102, 241, 0.6);
      }
      
      .chat-floater-toggle.hidden {
        display: none;
      }
      
      .chat-floater-window.hidden {
        display: none;
      }
    `;
    document.head.appendChild(style);
  },

  // Vincular eventos
  bindEvents() {
    // Toggle chat
    document.getElementById('chat-toggle').addEventListener('click', () => {
      this.toggle();
    });
    
    // Cerrar chat
    document.getElementById('chat-close').addEventListener('click', () => {
      this.close();
    });
    
    // Minimizar chat
    document.getElementById('chat-minimize').addEventListener('click', () => {
      this.toggleMinimize();
    });
    
    // Enviar mensaje
    document.getElementById('chat-input-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
    
    // Hacer draggable
    if (this.config.draggable) {
      this.makeDraggable();
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.close();
      }
    });
  },

  // Hacer ventana draggable
  makeDraggable() {
    const header = this.container.querySelector('.chat-floater-header');
    const windowEl = this.container.querySelector('.chat-floater-window');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.chat-control')) return;
      isDragging = true;
      const rect = windowEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      windowEl.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      windowEl.style.left = (startLeft + dx) + 'px';
      windowEl.style.top = (startTop + dy) + 'px';
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      windowEl.style.transition = 'all 0.3s ease';
    });
  },

  // Toggle chat open/close
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    this.state.isOpen = true;
    this.container.querySelector('.chat-floater-window').classList.remove('hidden');
    this.container.querySelector('.chat-floater-toggle').classList.add('hidden');
    this.renderMessages();
    document.getElementById('chat-input').focus();
  },

  close() {
    this.state.isOpen = false;
    this.state.isMinimized = false;
    this.container.querySelector('.chat-floater-window').classList.add('hidden');
    this.container.querySelector('.chat-floater-window').classList.remove('minimized');
    this.container.querySelector('.chat-floater-toggle').classList.remove('hidden');
  },

  toggleMinimize() {
    this.state.isMinimized = !this.state.isMinimized;
    this.container.querySelector('.chat-floater-window').classList.toggle('minimized');
  },

  // Enviar mensaje
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario
    this.addMessage(message, 'user');
    input.value = '';
    
    // Procesar respuesta
    const response = await this.processMessage(message);
    setTimeout(() => {
      this.addMessage(response, 'bot');
    }, 300);
  },

  // Procesar mensaje con IA personalizada
  async processMessage(message) {
    // Si hay API key configurada, usar IA real
    if (this.config.apiKey && this.config.usePersonalAI) {
      try {
        return await this.callPersonalAI(message);
      } catch (error) {
        console.error('Error con IA personal:', error);
        return this.generateLocalResponse(message);
      }
    }
    
    // Fallback a lógica local inteligente
    return this.generateLocalResponse(message);
  },

  // Llamar a IA personalizada
  async callPersonalAI(message) {
    // TODO: Implementar conexión a OpenAI/Anthropic/Custom
    // Ejemplo:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{ role: 'user', content: message }]
    //   })
    // });
    // const data = await response.json();
    // return data.choices[0].message.content;
    
    // Por ahora, retornar respuesta local
    return this.generateLocalResponse(message);
  },

  // Generar respuesta local inteligente
  generateLocalResponse(message) {
    const msg = message.toLowerCase();
    
    // Comandos de sistema
    if (msg.includes('agenda') || msg.includes('calendario')) {
      return '📅 Ve a la sección de Agenda para ver tus eventos programados. ¿Quieres que abra la página?';
    }
    
    if (msg.includes('estudio') || msg.includes('curso')) {
      return '📚 Tienes 3 cursos activos. Prompt Engineering está al 60%. ¿Quieres ver el progreso detallado?';
    }
    
    if (msg.includes('finanza') || msg.includes('gasto') || msg.includes('dinero')) {
      return '💰 Has gastado $12.40 este mes. Presupuesto restante: $487.60. ¿Registro un gasto?';
    }
    
    if (msg.includes('bienestar') || msg.includes('agua') || msg.includes('salud')) {
      return '💧 Has consumido 1.8L de 2.5L de agua. Sueño: 7h 40m. ¿Quieres registrar algo?';
    }
    
    if (msg.includes('tarea') || msg.includes('completar')) {
      return '✅ Tienes 8 tareas pendientes. La próxima es Reunión de Proyecto a las 10:00.';
    }
    
    if (msg.includes('hola') || msg.includes('buenos')) {
      return '¡Hola! 👋 Soy tu asistente. Puedo ayudarte con agenda, estudios, finanzas y bienestar. ¿En qué te ayudo?';
    }
    
    if (msg.includes('ayuda') || msg.includes('comandos')) {
      return `🤖 **Comandos disponibles:**
• Agenda: "qué tengo hoy", "agendar reunión"
• Estudios: "progreso cursos", "módulo siguiente"
• Finanzas: "registrar gasto", "balance mensual"
• Bienestar: "beber agua", "registrar sueño"`;
    }
    
    // Respuesta por defecto con personalidad
    const responses = [
      'Interesante punto. ¿Quieres que investigue más sobre eso?',
      'Voy a verificar eso en tu dashboard...',
      'Entiendo. Déjame buscar esa información.',
      '¿Te refieres a tu agenda o estudios?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // Agregar mensaje al chat
  addMessage(text, sender) {
    this.state.messages.push({ text, sender, timestamp: new Date() });
    this.saveHistory();
    this.renderMessages();
  },

  // Renderizar mensajes
  renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    container.innerHTML = this.state.messages.map(msg => `
      <div class="chat-message ${msg.sender}">
        ${msg.text}
      </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
  },

  // Cargar historial
  loadHistory() {
    const saved = localStorage.getItem('chat-floater-history');
    if (saved) {
      this.state.messages = JSON.parse(saved);
      // Mensaje inicial si no hay historial
      if (this.state.messages.length === 0) {
        this.addMessage('¡Hola! Soy tu asistente personal. ¿En qué puedo ayudarte hoy?', 'bot');
      }
    } else {
      this.addMessage('¡Hola! Soy tu asistente personal. ¿En qué puedo ayudarte hoy?', 'bot');
    }
  },

  // Guardar historial
  saveHistory() {
    localStorage.setItem('chat-floater-history', JSON.stringify(this.state.messages.slice(-100)));
  },

  // Renderizar
  render() {
    this.renderMessages();
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ChatFloater.init());
} else {
  ChatFloater.init();
}

// Exponer globalmente
window.ChatFloater = ChatFloater;
