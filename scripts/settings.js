// Settings Modal & Integration System
const SettingsSystem = {
  config: {
        aiProvider: 'openai', // 'openai', 'anthropic', 'custom'
    apiKey: '',
    apiEndpoint: '',
    theme: 'true-black', // 'true-black', 'midnight', 'cyberpunk', 'minimal'
    layoutDensity: 'comfortable', // 'comfortable', 'compact', 'spacious'
    googleConnected: false,
    githubConnected: false,
    githubToken: ''
  },

  init() {
    this.loadConfig();
    this.createSettingsModal();
    this.addSettingsButton();
    this.applySettings();
    console.log('⚙️ SettingsSystem inicializado');
  },

  loadConfig() {
    const saved = localStorage.getItem('miAsistente_settings');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
  },

  saveConfig() {
    localStorage.setItem('miAsistente_settings', JSON.stringify(this.config));
    this.applySettings();
  },

  createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'settings-modal hidden';
    modal.innerHTML = `
      <div class="settings-panel">
        <header class="settings-header">
          <div class="flex items-center gap-2">
            <span>⚙️</span>
            <h2 class="text-base font-bold">Ajustes del Sistema</h2>
          </div>
          <button class="chat-btn" id="settings-close">✕</button>
        </header>

        <div class="settings-body">
          <!-- Sección IA -->
          <div class="settings-section">
            <h3>🤖 Configuración de IA</h3>
            <div class="setting-group">
              <label>Proveedor de IA</label>
              <select id="ai-provider" class="setting-input">
                <option value="openai">OpenAI (GPT-4 / GPT-3.5)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="custom">API Personalizada / Ollama</option>
              </select>
            </div>
            <div class="setting-group">
              <label>API Key / Token</label>
              <input type="password" id="ai-apikey" placeholder="sk-..." class="setting-input">
            </div>
            <div class="setting-group" id="endpoint-group" style="display:none;">
              <label>Endpoint URL (para API Custom)</label>
              <input type="text" id="ai-endpoint" placeholder="https://api.tu-servidor.com/v1/chat" class="setting-input">
            </div>
          </div>

          <!-- Sección Apariencia -->
          <div class="settings-section">
            <h3>🎨 Apariencia y Tema</h3>
            <div class="setting-group">
              <label>Tema Visual</label>
              <select id="theme-select" class="setting-input">
                <option value="true-black">True Black Flat (Por defecto)</option>
                <option value="midnight">Midnight Blue</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="minimal">Minimal Light</option>
              </select>
            </div>
            <div class="setting-group">
              <label>Densidad de Diseño</label>
              <select id="density-select" class="setting-input">
                <option value="comfortable">Cómodo (Espaciado normal)</option>
                <option value="compact">Compacto (Más datos en pantalla)</option>
                <option value="spacious">Amplio (Minimalista)</option>
              </select>
            </div>
          </div>

          <!-- Sección Integraciones -->
          <div class="settings-section">
            <h3>🔗 Integraciones Externas</h3>
            <div class="integration-item">
              <div>
                <span class="font-medium">Google Workspace</span>
                <p class="text-xs text-secondary">Calendario, Gmail y Drive</p>
              </div>
              <button class="btn text-xs" id="google-connect-btn">Conectar</button>
            </div>
            <div class="integration-item">
              <div>
                <span class="font-medium">GitHub</span>
                <p class="text-xs text-secondary">Repositorios y Issues</p>
              </div>
              <button class="btn text-xs" id="github-connect-btn">Conectar</button>
            </div>
          </div>
        </div>

        <footer class="settings-footer">
          <button class="btn" id="settings-cancel">Cancelar</button>
          <button class="btn primary" id="settings-save" style="background:#c6f24e; color:#000;">Guardar Cambios</button>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
    this.addStyles();
    this.bindModalEvents();
  },

  addSettingsButton() {
    const nav = document.querySelector('.nav') || document.querySelector('header');
    if (nav) {
      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'settings-nav-btn';
      btn.innerHTML = '⚙️ Ajustes';
      btn.style.cssText = 'cursor:pointer; display:flex; align-items:center; gap:4px; font-size:13px; color:var(--muted);';
      btn.onclick = (e) => { e.preventDefault(); this.openModal(); };
      nav.appendChild(btn);
    }
  },

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .settings-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .settings-modal.active {
        opacity: 1;
        pointer-events: all;
      }
      .settings-panel {
        width: 100%;
        max-width: 520px;
        background: #111;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 25px 80px rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-height: 90vh;
      }
      .settings-header {
        padding: 18px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .settings-body {
        padding: 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .settings-section h3 {
        font-size: 14px;
        font-weight: 600;
        color: var(--accent, #c6f24e);
        margin-bottom: 12px;
      }
      .setting-group {
        margin-bottom: 14px;
      }
      .setting-group label {
        display: block;
        font-size: 12px;
        color: var(--secondary);
        margin-bottom: 6px;
      }
      .setting-input {
        width: 100%;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 10px 14px;
        color: white;
        font-size: 13px;
        outline: none;
      }
      .setting-input:focus {
        border-color: var(--accent, #c6f24e);
      }
      .integration-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        margin-bottom: 10px;
      }
      .settings-footer {
        padding: 16px 24px;
        border-top: 1px solid rgba(255,255,255,0.08);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);
  },

  bindModalEvents() {
    document.getElementById('settings-close').onclick = () => this.closeModal();
    document.getElementById('settings-cancel').onclick = () => this.closeModal();
    document.getElementById('settings-save').onclick = () => {
      this.saveFormValues();
      this.closeModal();
    };
    
    document.getElementById('ai-provider').onchange = (e) => {
      const endpointGroup = document.getElementById('endpoint-group');
      endpointGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
    };

    document.getElementById('google-connect-btn').onclick = () => {
      alert('Simulando autenticación con Google Workspace... ¡Conectado con éxito!');
      this.config.googleConnected = true;
      document.getElementById('google-connect-btn').textContent = '✅ Conectado';
      document.getElementById('google-connect-btn').style.background = '#22c55e';
      document.getElementById('google-connect-btn').style.color = '#fff';
    };

    document.getElementById('github-connect-btn').onclick = () => {
      const token = prompt('Introduce tu GitHub Personal Access Token (PAT):');
      if (token) {
        this.config.githubToken = token;
        this.config.githubConnected = true;
        alert('¡GitHub conectado correctamente!');
        document.getElementById('github-connect-btn').textContent = '✅ Conectado';
        document.getElementById('github-connect-btn').style.background = '#22c55e';
        document.getElementById('github-connect-btn').style.color = '#fff';
      }
    };
  },

  openModal() {
    // Rellenar valores actuales
    document.getElementById('ai-provider').value = this.config.aiProvider;
    document.getElementById('ai-apikey').value = this.config.apiKey;
    document.getElementById('ai-endpoint').value = this.config.apiEndpoint;
    document.getElementById('theme-select').value = this.config.theme;
    document.getElementById('density-select').value = this.config.layoutDensity;
    
    if (this.config.aiProvider === 'custom') {
      document.getElementById('endpoint-group').style.display = 'block';
    }

    document.getElementById('settings-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('settings-modal').classList.remove('active');
  },

  saveFormValues() {
    this.config.aiProvider = document.getElementById('ai-provider').value;
    this.config.apiKey = document.getElementById('ai-apikey').value;
    this.config.apiEndpoint = document.getElementById('ai-endpoint').value;
    this.config.theme = document.getElementById('theme-select').value;
    this.config.layoutDensity = document.getElementById('density-select').value;
    this.saveConfig();
    alert('✅ Ajustes guardados correctamente.');
  },

  applySettings() {
    // Aplicar tema
    const root = document.documentElement;
    if (this.config.theme === 'midnight') {
      root.style.setProperty('--ground', '#030712');
      root.style.setProperty('--surface', '#111827');
      root.style.setProperty('--accent', '#38bdf8');
    } else if (this.config.theme === 'cyberpunk') {
      root.style.setProperty('--ground', '#05050a');
      root.style.setProperty('--surface', '#0f0f1a');
      root.style.setProperty('--accent', '#f43f5e');
    } else if (this.config.theme === 'minimal') {
      root.style.setProperty('--ground', '#ffffff');
      root.style.setProperty('--surface', '#f8fafc');
      root.style.setProperty('--text', '#0f172a');
      root.style.setProperty('--accent', '#2563eb');
    }
    
    // Sincronizar API Key con ChatFloaterV2 si existe
    if (typeof ChatFloaterV2 !== 'undefined') {
      ChatFloaterV2.config.apiKey = this.config.apiKey;
      ChatFloaterV2.config.aiProvider = this.config.aiProvider;
    }
  }
};

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SettingsSystem.init());
} else {
  SettingsSystem.init();
}

window.SettingsSystem = SettingsSystem;
