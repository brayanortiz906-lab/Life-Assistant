// Chat Flotante v2 - Completo con gestos
const ChatFloaterV2 = {
  config: {
    usePersonalAI: true,
    draggable: true,
    closable: true,
    minimizable: true
  },

  state: {
    isOpen: false,
    isMinimized: false,
    messages: []
  },

  init() {
    this.createElements();
    this.bindEvents();
    this.addStyles();
    this.loadHistory();
    this.renderMessages();
    console.log('✅ Chat Floater v2 inicializado');
  },

  createElements() {
    this.container = document.createElement('div');
    this.container.id = 'chat-floater-container';
    this.container.innerHTML = `
      <div class="chat-floater-window" id="chat-floater-window">
        <div class="chat-floater-header">
          <span>💬 Asistente IA</span>
          <div class="chat-controls">
            <button class="chat-btn" id="chat-min">−</button>
            <button class="chat-btn" id="chat-close">✕</button>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <form class="chat-input" id="chat-form">
          <input type="text" id="chat-input" placeholder="Escribe...">
          <button type="submit">➤</button>
        </form>
      </div>
      <button class="chat-launcher" id="chat-launcher">💬</button>
      <div class="chat-backdrop" id="chat-backdrop"></div>
    `;
    document.body.appendChild(this.container);
  },

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #chat-floater-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
      }
      
      .chat-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
        pointer-events: all;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 100000;
      }
      
      .chat-launcher:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 40px rgba(99, 102, 241, 0.7);
      }
      
      .chat-launcher.hidden {
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
      }
      
      .chat-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 99998;
      }
      
      .chat-backdrop.active {
        opacity: 1;
        pointer-events: all;
      }
      
      .chat-floater-window {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 380px;
        height: 520px;
        background: rgba(15, 15, 15, 0.95);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        scale: 0.8;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 99999;
      }
      
      .chat-floater-window.active {
        opacity: 1;
        scale: 1;
        pointer-events: all;
      }
      
      .chat-floater-window.minimized {
        height: 52px;
        width: 280px;
      }
      
      .chat-floater-header {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.15));
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        font-weight: 600;
        font-size: 14px;
      }
      
      .chat-floater-window.minimized .chat-floater-header {
        border-bottom: none;
      }
      
      .chat-controls {
        display: flex;
        gap: 8px;
      }
      
      .chat-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.7);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .chat-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      
      .chat-floater-window.minimized .chat-messages,
      .chat-floater-window.minimized .chat-input {
        display: none;
      }
      
      .chat-message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
      }
      
      .chat-message.user {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.3));
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      
      .chat-message.bot {
        background: rgba(255, 255, 255, 0.06);
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      
      .chat-input {
        display: flex;
        padding: 14px;
        gap: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.2);
      }
      
      .chat-input input {
        flex: 1;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 10px 14px;
        color: white;
        font-size: 13.5px;
        outline: none;
      }
      
      .chat-input input:focus {
        border-color: rgba(99, 102, 241, 0.6);
        background: rgba(255, 255, 255, 0.08);
      }
      
      .chat-input button {
        background: #c6f24e;
        color: #000;
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .chat-input button:hover {
        background: #a8e93a;
        transform: translateY(-1px);
      }
      
      @media (max-width: 480px) {
        .chat-floater-window {
          width: 92%;
          height: 70vh;
        }
      }
    `;
    document.head.appendChild(style);
  },

  bindEvents() {
    const launcher = document.getElementById('chat-launcher');
    const windowEl = document.getElementById('chat-floater-window');
    const backdrop = document.getElementById('chat-backdrop');
    const minBtn = document.getElementById('chat-min');
    const closeBtn = document.getElementById('chat-close');
    const form = document.getElementById('chat-form');
    
    // Abrir con launcher
    launcher.addEventListener('click', () => {
      if (!this.state.isOpen) {
        this.open();
      } else if (this.state.isMinimized) {
        this.open();
      }
    });
    
    // Cerrar con X
    closeBtn.addEventListener('click', () => this.close());
    
    // Minimizar
    minBtn.addEventListener('click', () => this.toggleMinimize());
    
    // Backdrop click
    backdrop.addEventListener('click', () => this.minimize());
    
    // Enviar mensaje
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
    
    // Draggable
    this.makeDraggable(windowEl);
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.minimize();
      }
    });
  },

  makeDraggable(windowEl) {
    const header = windowEl.querySelector('.chat-floater-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.chat-btn')) return;
      isDragging = true;
      const rect = windowEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      windowEl.style.transition = 'none';
      header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      windowEl.style.left = (startLeft + dx) + 'px';
      windowEl.style.top = (startTop + dy) + 'px';
      windowEl.style.transform = 'none';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'move';
      windowEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  },

  open() {
    this.state.isOpen = true;
    this.state.isMinimized = false;
    document.getElementById('chat-floater-window').classList.add('active');
    document.getElementById('chat-floater-window').classList.remove('minimized');
    document.getElementById('chat-backdrop').classList.add('active');
    document.getElementById('chat-launcher').classList.add('hidden');
    document.getElementById('chat-input').focus();
    this.renderMessages();
  },

  close() {
    this.state.isOpen = false;
    this.state.isMinimized = false;
    document.getElementById('chat-floater-window').classList.remove('active');
    document.getElementById('chat-backdrop').classList.remove('active');
    document.getElementById('chat-launcher').classList.remove('hidden');
  },

  toggleMinimize() {
    if (!this.state.isOpen) return;
    
    this.state.isMinimized = !this.state.isMinimized;
    const windowEl = document.getElementById('chat-floater-window');
    windowEl.classList.toggle('minimized');
    
    if (this.state.isMinimized) {
      // Ver conversacion en el launcher
      document.getElementById('chat-launcher').textContent = '💬•';
    } else {
      document.getElementById('chat-launcher').textContent = '💬';
    }
  },

  minimize() {
    if (this.state.isOpen && !this.state.isMinimized) {
      this.toggleMinimize();
    } else if (this.state.isOpen) {
      this.close();
    }
  },

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    input.disabled = true;
    
    // Simular typing
    setTimeout(async () => {
      const response = this.generateResponse(message);
      this.addMessage(response, 'bot');
      input.disabled = false;
      input.focus();
    }, 800);
  },

  generateResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('agenda') || msg.includes('calendario')) {
      return '📅 Tienes 2 eventos hoy. ¿Quieres que abra la agenda?';
    }
    
    if (msg.includes('estudio') || msg.includes('curso')) {
      return '📚 Prompt Engineering al 60%. ¿Avanzamos al módulo 3?';
    }
    
    if (msg.includes('finanza') || msg.includes('gasto')) {
      return '💰 Balance: $12.40 gastados. Presupuesto disponible: $487.60';
    }
    
    if (msg.includes('bienestar') || msg.includes('agua')) {
      return '💧 Hidratación: 1.8/2.5L. ¿Quieres registrar más agua?';
    }
    
    const responses = [
      'Entiendo. ¿Puedo ayudarte con algo específico del dashboard?',
      'Interesante. Dime más detalles.',
      'Voy a verificar eso en tu sistema...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },

  addMessage(text, sender) {
    this.state.messages.push({ text, sender, time: new Date() });
    this.saveHistory();
    this.renderMessages();
  },

  renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    if (this.state.messages.length === 0) {
      container.innerHTML = `<div class="chat-message bot">¡Hola! Soy tu asistente. ¿En qué te ayudo?</div>`;
      return;
    }
    
    container.innerHTML = this.state.messages.map(m => 
      `<div class="chat-message ${m.sender}">${m.text}</div>`
    ).join('');
    
    container.scrollTop = container.scrollHeight;
  },

  loadHistory() {
    const saved = localStorage.getItem('chat-floater-v2-history');
    if (saved) {
      this.state.messages = JSON.parse(saved);
    } else {
      this.addMessage('¡Hola! Soy tu asistente personal. ¿En qué te ayudo?', 'bot');
    }
  },

  saveHistory() {
    localStorage.setItem('chat-floater-v2-history', JSON.stringify(this.state.messages.slice(-50)));
  }
};

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ChatFloaterV2.init());
} else {
  ChatFloaterV2.init();
}

window.ChatFloaterV2 = ChatFloaterV2;
