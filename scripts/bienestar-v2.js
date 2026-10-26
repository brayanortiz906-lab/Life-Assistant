// Bienestar System v2 - Health & Wellness Tracking Mejorado
const BienestarSystem = {
  
  // Métricas principales con metas personalizadas
  water: { current: 1.8, target: 2.5, history: [], color: '#06b6d4', icon: '💧' },
  sleep: { current: 7.67, target: 8, history: [], color: '#6366f1', icon: '😴' },
  exercise: { current: 0, target: 30, history: [], color: '#22c55e', icon: '🏃' },
  nutrition: { calories: 0, target: 2000, meals: [], color: '#f97316', icon: '🍎' },
  weight: { current: null, target: null, history: [], color: '#eab308', icon: '⚖️' },
  meditation: { current: 0, target: 10, history: [], color: '#a855f7', icon: '🧘' },
  steps: { current: 0, target: 10000, history: [], color: '#ec4899', icon: '👟' },

  init() {
    this.loadData();
    this.renderDashboard();
    this.renderAdvancedMetrics();
    this.bindEvents();
    console.log('🧘 Bienestar System v2 inicializado');
  },

  loadData() {
    const saved = localStorage.getItem('miAsistente_bienestar_v2');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        if (this[key]) this[key] = { ...this[key], ...data[key] };
      });
    } else {
      this.generateSampleData();
    }
    this.updateDashboardStats();
  },

  generateSampleData() {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 86400000);
      const dateStr = this.formatDate(date);
      
      this.water.history.push({ date: dateStr, value: +(Math.random() * 1.5 + 1).toFixed(1) });
      this.sleep.history.push({ date: dateStr, value: +(Math.random() * 1.5 + 6.5).toFixed(1) });
      this.exercise.history.push({ date: dateStr, value: Math.floor(Math.random() * 45 + 15) });
      this.steps.history.push({ date: dateStr, value: Math.floor(Math.random() * 4000 + 6000) });
      this.meditation.history.push({ date: dateStr, value: Math.floor(Math.random() * 15 + 5) });
      this.weight.history.push({ date: dateStr, value: +(Math.random() * 1 + 70).toFixed(1) });
    }
    this.saveData();
  },

  saveData() {
    localStorage.setItem('miAsistente_bienestar_v2', JSON.stringify(this));
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  // Renderizado avanzado del dashboard
  renderAdvancedMetrics() {
    this.renderMetricCard('water-detail', this.water);
    this.renderMetricCard('sleep-detail', this.sleep);
    this.renderMetricCard('exercise-detail', this.exercise);
    this.renderMetricCard('nutrition-detail', this.nutrition);
    this.renderStepsCard();
    this.renderMeditationCard();
    this.renderWeightChart();
    this.renderStreaks();
    this.renderWeeklyComparison();
  },

  renderMetricCard(containerId, metric) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = metric.target ? (metric.current / metric.target * 100) : 0;
    const progress = Math.min(percentage, 100);
    const isGood = percentage >= 90;
    
    container.innerHTML = `
      <div class="metric-card p-4 bg-surface/50 rounded-xl border border-border">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">${metric.icon}</span>
            <h3 class="text-sm font-bold capitalize">${containerId.replace('-detail', '')}</h3>
          </div>
          <span class="text-xs px-2 py-1 rounded-full ${isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
            ${Math.round(progress)}%
          </span>
        </div>
        
        <div class="text-2xl font-bold mb-2" style="color: ${metric.color}">
          ${metric.current} <span class="text-sm text-secondary">/ ${metric.target || '—'}</span>
        </div>
        
        <div class="progress-bar mb-3">
          <div class="progress-fill" style="width: ${progress}%; background: ${metric.color}"></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-secondary">
          <span>7 días</span>
          <span>Tendencia: ${this.getTrend(metric.history)} ↗</span>
        </div>
      </div>
    `;
  },

  renderStepsCard() {
    const container = document.getElementById('steps-detail');
    if (!container) return;
    this.renderMetricCard('steps-detail', this.steps);
  },

  renderMeditationCard() {
    const container = document.getElementById('meditation-detail');
    if (!container) return;
    this.renderMetricCard('meditation-detail', this.meditation);
  },

  renderWeightChart() {
    const canvas = document.getElementById('weight-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    const padding = 40;
    
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = padding + (height - padding * 2) * i / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Dibujar línea de peso
    const data = this.weight.history;
    if (data.length > 1) {
      const maxVal = Math.max(...data.map(d => d.value));
      const minVal = Math.min(...data.map(d => d.value));
      const range = maxVal - minVal || 1;
      
      ctx.beginPath();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 10;
      
      data.forEach((point, i) => {
        const x = padding + (width - padding * 2) * i / (data.length - 1);
        const y = height - padding - ((point.value - minVal) / range) * (height - padding * 2);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        // Puntos
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.stroke();
    }
  },

  renderStreaks() {
    const container = document.getElementById('streaks-grid');
    if (!container) return;

    const streaks = [
      { name: 'Hidratación', value: 5, icon: '💧', color: '#06b6d4' },
      { name: 'Sueño', value: 3, icon: '😴', color: '#6366f1' },
      { name: 'Ejercicio', value: 7, icon: '🏃', color: '#22c55e' },
      { name: 'Meditación', value: 2, icon: '🧘', color: '#a855f7' }
    ];

    container.innerHTML = streaks.map(streak => `
      <div class="streak-item p-3 bg-surface/50 rounded-lg border border-border text-center">
        <div class="text-2xl mb-1">${streak.icon}</div>
        <div class="font-bold">${streak.value}</div>
        <div class="text-[10px] text-secondary">${streak.name}</div>
        <div class="text-[10px] text-accent mt-1">días 🔥</div>
      </div>
    `).join('');
  },

  renderWeeklyComparison() {
    const container = document.getElementById('weekly-comparison');
    if (!container) return;

    const metrics = [
      { name: 'Agua', current: this.water.current, previous: 1.5 },
      { name: 'Sueño', current: this.sleep.current, previous: 7.2 },
      { name: 'Ejercicio', current: this.exercise.current, previous: 22 },
      { name: 'Pasos', current: this.steps.current, previous: 7500 }
    ];

    container.innerHTML = metrics.map(m => {
      const change = ((m.current - m.previous) / m.previous * 100).toFixed(0);
      const isPositive = change >= 0;
      
      return `
        <div class="comparison-item flex items-center justify-between p-3 bg-surface/30 rounded-lg">
          <span class="text-xs">${m.name}</span>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold">${m.current}</span>
            <span class="text-[11px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}">
              ${isPositive ? '↗' : '↘'} ${Math.abs(change)}%
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  getTrend(history) {
    if (history.length < 2) return 'estable';
    const recent = history.slice(-3).reduce((a, b) => a + b.value, 0) / 3;
    const previous = history.slice(-6, -3).reduce((a, b) => a + b.value, 0) / 3;
    if (recent > previous) return 'subiendo';
    if (recent < previous) return 'bajando';
    return 'estable';
  },

  bindEvents() {
    // Botones de acción rápida
    document.getElementById('add-water-btn')?.addEventListener('click', () => {
      this.water.current += 0.25;
      this.updateMetricDisplay('water-detail', this.water);
      this.saveData();
      this.showToast('💧 +250ml registrados');
    });

    document.getElementById('add-sleep-btn')?.addEventListener('click', () => {
      this.sleep.current += 0.5;
      this.updateMetricDisplay('sleep-detail', this.sleep);
      this.saveData();
      this.showToast('😴 Sueño registrado +30min');
    });

    document.getElementById('log-exercise-btn')?.addEventListener('click', () => {
      this.exercise.current += 10;
      this.updateMetricDisplay('exercise-detail', this.exercise);
      this.saveData();
      this.showToast('🏃 +10min ejercicio');
    });

    // Botón de añadir comida rápida
    document.getElementById('quick-meal-btn')?.addEventListener('click', () => {
      const meals = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
      const randomMeal = meals[Math.floor(Math.random() * meals.length)];
      this.nutrition.meals.push({ type: randomMeal, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) });
      this.saveData();
      this.renderNutritionDetail();
      this.showToast(`🍎 ${randomMeal} registrado`);
    });
  },

  updateMetricDisplay(containerId, metric) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.renderMetricCard(containerId, metric);
  },

  renderNutritionDetail() {
    const container = document.getElementById('nutrition-detail');
    if (!container) return;
    
    const mealsCount = this.nutrition.meals.length;
    container.innerHTML = `
      <div class="metric-card p-4 bg-surface/50 rounded-xl border border-border">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">🍎</span>
          <h3 class="text-sm font-bold">Nutrición</h3>
        </div>
        
        <div class="text-2xl font-bold mb-2" style="color: ${this.nutrition.color}">
          ${this.nutrition.calories} <span class="text-sm text-secondary">/ ${this.nutrition.target} kcal</span>
        </div>
        
        <div class="space-y-1 mb-3">
          ${this.nutrition.meals.slice(-3).reverse().map(meal => `
            <div class="flex justify-between text-[11px] text-secondary py-1">
              <span>${meal.type}</span>
              <span>${meal.time}</span>
            </div>
          `).join('') || '<p class="text-[11px] text-secondary">No hay comidas registradas</p>'}
        </div>

        <button id="quick-meal-btn" class="btn w-full text-xs py-2 mt-2 bg-orange-500/20 text-orange-400 border border-orange-500/30">
          + Registrar comida
        </button>
      </div>
    `;
    
    document.getElementById('quick-meal-btn')?.addEventListener('click', () => {
      this.nutrition.meals.push({ type: 'Snack', time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) });
      this.renderNutritionDetail();
      this.saveData();
    });
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'bienestar-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 100000;
      animation: slideInUp 0.3s ease;
      font-size: 13px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  updateDashboardStats() {
    // Actualiza métricas del dashboard principal
    const elements = {
      'water-text': `${this.water.current.toFixed(1)} / ${this.water.target}L`,
      'water-current': this.water.current,
      'sleep-current': this.sleep.current.toFixed(1),
      'exercise-current': this.exercise.current,
      'steps-current': this.steps.current.toLocaleString()
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }
};

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BienestarSystem.init());
} else {
  BienestarSystem.init();
}

window.BienestarSystem = BienestarSystem;
