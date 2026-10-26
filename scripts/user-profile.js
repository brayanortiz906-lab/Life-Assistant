// User Profile & Multi-Account Manager
const UserProfileSystem = {
  // Estado del usuario activo
  currentProfile: {
    id: 'default',
    name: 'Usuario',
    email: '',
    avatar: '👤',
    googleAccount: null, // { email, name, picture, accessToken }
    githubAccount: null,
    preferences: {
      aiName: 'Asistente'
    }
  },

  // Lista de perfiles guardados
  profiles: [],

  init() {
    this.loadProfiles();
    this.createProfileUI();
    this.bindEvents();
    console.log('👤 UserProfileSystem inicializado');
  },

  loadProfiles() {
    const savedProfiles = localStorage.getItem('miAsistente_profiles');
    if (savedProfiles) {
      this.profiles = JSON.parse(savedProfiles);
    }

    const activeId = localStorage.getItem('miAsistente_active_profile_id');
    if (activeId && this.profiles.length > 0) {
      const found = this.profiles.find(p => p.id === activeId);
      if (found) this.currentProfile = found;
    } else {
      // Crear perfil por defecto si no existe
      if (this.profiles.length === 0) {
        this.profiles.push(this.currentProfile);
        this.saveProfiles();
      }
    }
  },

  saveProfiles() {
    localStorage.setItem('miAsistente_profiles', JSON.stringify(this.profiles));
    localStorage.setItem('miAsistente_active_profile_id', this.currentProfile.id);
  },

  createProfileUI() {
    // 1. Agregar widget de Perfil en la cabecera
    const header = document.querySelector('header');
    if (header) {
      const profileWidget = document.createElement('div');
      profileWidget.className = 'profile-widget flex items-center gap-2 cursor-pointer ml-auto pr-4';
      profileWidget.id = 'profile-widget-trigger';
      profileWidget.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-sm" id="user-avatar">
          ${this.currentProfile.avatar}
        </div>
        <div class="hidden md:block text-left">
          <p class="text-xs font-bold leading-none text-white" id="user-display-name">${this.currentProfile.name}</p>
          <p class="text-[10px] text-secondary leading-tight" id="user-google-status">${this.currentProfile.googleAccount ? this.currentProfile.googleAccount.email : 'Sin Google'}</p>
        </div>
      `;
      header.appendChild(profileWidget);
    }

    // 2. Crear Modal de Gestión de Perfil & Google OAuth
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'settings-modal hidden';
    modal.innerHTML = `
      <div class="settings-panel">
        <header class="settings-header">
          <div class="flex items-center gap-2">
            <span>👤</span>
            <h2 class="text-base font-bold">Perfil de Usuario & Google OAuth</h2>
          </div>
          <button class="chat-btn" id="profile-close">✕</button>
        </header>

        <div class="settings-body">
          <!-- Nombre Personalizado -->
          <div class="settings-section">
            <h3>🏷️ ¿Cómo quieres que te llame la IA?</h3>
            <div class="setting-group">
              <label>Tu Nombre / Apodo Preferido</label>
              <input type="text" id="profile-name-input" value="${this.currentProfile.name}" placeholder="Ej: Brayan, Carlos, Ana..." class="setting-input">
            </div>
          </div>

          <!-- Conexión OAuth Google Real / Simulado -->
          <div class="settings-section">
            <h3>🌐 Vinculación de Cuenta Google</h3>
            <p class="text-xs text-secondary mb-3">Conecta tu cuenta personal de Google para sincronizar Calendario, Gmail y Drive directamente a tu perfil.</p>
            
            <div id="google-account-info" class="p-3 bg-surface/50 border border-border rounded-xl mb-3 ${this.currentProfile.googleAccount ? '' : 'hidden'}">
              <div class="flex items-center gap-3">
                <img id="google-avatar-img" src="${this.currentProfile.googleAccount?.picture || ''}" class="w-10 h-10 rounded-full border border-accent/40">
                <div>
                  <p class="text-xs font-bold text-white" id="google-name">${this.currentProfile.googleAccount?.name || ''}</p>
                  <p class="text-[11px] text-secondary" id="google-email">${this.currentProfile.googleAccount?.email || ''}</p>
                </div>
              </div>
            </div>

            <button class="btn w-full justify-center gap-2" id="google-login-btn" style="background: #4285F4; color: white; border: none;">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.8h5.4c-.2 1.2-1 2.3-2.3 3.1v2.5h3.7c2.2-2 3.5-5 3.5-8.6 0-.6-.1-1.3-.3-1.8z"/><path fill="currentColor" d="M12 21c3.2 0 6-1.1 8-3l-3.7-2.5c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.3H1.1v2.6C3.2 18.2 7.3 21 12 21z"/><path fill="currentColor" d="M4.9 11.4C4.6 10.5 4.6 9.5 4.9 8.6V6H1.1C-.4 9-.4 12.6 1.1 15.6l3.8-2.6z"/><path fill="currentColor" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.4 15.1.5 12 .5 7.3.5 3.2 3.3 1.1 7.4l3.8 2.6c1-3.1 3.8-5.2 7.1-5.2z"/></svg>
              <span id="google-btn-text">${this.currentProfile.googleAccount ? 'Desconectar Cuenta Google' : 'Vincular con Google'}</span>
            </button>
          </div>
        </div>

        <footer class="settings-footer">
          <button class="btn primary" id="profile-save-btn" style="background:#c6f24e; color:#000;">Guardar Perfil</button>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
  },

  bindEvents() {
    const trigger = document.getElementById('profile-widget-trigger');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('profile-close');
    const saveBtn = document.getElementById('profile-save-btn');
    const googleBtn = document.getElementById('google-login-btn');

    if (trigger) trigger.onclick = () => this.openModal();
    if (closeBtn) closeBtn.onclick = () => this.closeModal();
    if (saveBtn) saveBtn.onclick = () => this.saveProfileChanges();

    if (googleBtn) {
      googleBtn.onclick = () => {
        if (this.currentProfile.googleAccount) {
          // Desconectar
          this.currentProfile.googleAccount = null;
          this.updateUI();
          this.saveProfiles();
          alert('Cuenta Google desvinculada');
        } else {
          // Simular OAuth login
          this.simulateGoogleAuth();
        }
      };
    }
  },

  simulateGoogleAuth() {
    const email = prompt('Introduce tu correo de Google:', 'usuario@gmail.com');
    if (!email) return;

    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    this.currentProfile.googleAccount = {
      email: email,
      name: formattedName,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nameFromEmail}`
    };

    // Actualizar también el nombre de pila si no ha sido cambiado manualmente
    if (this.currentProfile.name === 'Usuario') {
      this.currentProfile.name = formattedName;
    }

    this.updateUI();
    this.saveProfiles();

    // Notificar a la IA flotante sobre la bienvenida personalizada
    if (typeof ChatFloaterV2 !== 'undefined') {
      ChatFloaterV2.addMessage(`¡Hola **${this.currentProfile.name}**! He vinculado exitosamente tu cuenta de Google (${email}). ¿En qué puedo ayudarte hoy?`, 'bot');
    }

    alert(`¡Bienvenido ${formattedName}! Cuenta de Google vinculada correctamente.`);
  },

  openModal() {
    document.getElementById('profile-name-input').value = this.currentProfile.name;
    document.getElementById('profile-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('profile-modal').classList.remove('active');
  },

  saveProfileChanges() {
    const newName = document.getElementById('profile-name-input').value.trim();
    if (newName) {
      this.currentProfile.name = newName;
      this.updateUI();
      this.saveProfiles();
      
      // Actualizar saludo del asistente IA
      if (typeof ChatFloaterV2 !== 'undefined') {
        ChatFloaterV2.addMessage(`Nombre actualizado. De ahora en adelante te llamaré **${newName}** 😊.`, 'bot');
      }
    }
    this.closeModal();
  },

  updateUI() {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-display-name');
    const statusEl = document.getElementById('user-google-status');
    const googleInfoBox = document.getElementById('google-account-info');
    const googleBtnText = document.getElementById('google-btn-text');

    if (nameEl) nameEl.textContent = this.currentProfile.name;

    if (this.currentProfile.googleAccount) {
      if (statusEl) statusEl.textContent = this.currentProfile.googleAccount.email;
      if (googleBtnText) googleBtnText.textContent = 'Desconectar Cuenta Google';
      if (googleInfoBox) {
        googleInfoBox.classList.remove('hidden');
        document.getElementById('google-name').textContent = this.currentProfile.googleAccount.name;
        document.getElementById('google-email').textContent = this.currentProfile.googleAccount.email;
        document.getElementById('google-avatar-img').src = this.currentProfile.googleAccount.picture;
      }
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${this.currentProfile.googleAccount.picture}" class="w-full h-full rounded-full">`;
      }
    } else {
      if (statusEl) statusEl.textContent = 'Sin Google';
      if (googleBtnText) googleBtnText.textContent = 'Vincular con Google';
      if (googleInfoBox) googleInfoBox.classList.add('hidden');
      if (avatarEl) avatarEl.innerHTML = this.currentProfile.avatar;
    }
  }
};

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UserProfileSystem.init());
} else {
  UserProfileSystem.init();
}

window.UserProfileSystem = UserProfileSystem;
