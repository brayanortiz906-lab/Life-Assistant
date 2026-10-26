// Bienestar System - Health & Wellness Tracking

const BienestarSystem = {
  water: { current: 1.8, target: 2.5, history: [] },
  sleep: { current: 7.67, target: 8, history: [] }, // hours
  exercise: { current: 0, target: 30, history: [] }, // minutes
  nutrition: { meals: [], calories: 0, target: 2000 },
  weight: { current: null, target: null, history: [] },

  init() {
    this.loadData();
    this.renderDashboard();
    this.bindEvents();
  },

  loadData() {
    const saved = localStorage.getItem('miAsistente_bienestar');
    if (saved) {
      const data = JSON.parse(saved);
      this.water = { ...this.water, ...data.water };
      this.sleep = { ...this.sleep, ...data.sleep };
      this.exercise = { ...this.exercise, ...data.exercise };
      this.nutrition = { ...this.nutrition, ...data.nutrition };
      this.weight = { ...this.weight, ...data.weight };
    } else {
      // Sample history for last 7 days
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 86400000);
        const dateStr = this.formatDate(date);
        this.water.history.push({ date: dateStr, value: +(Math.random() * 1.5 + 1).toFixed(1) });
        this.sleep.history.push({ date: dateStr, value: +(Math.random() * 1.5 + 6.5).toFixed(1) });
        this.exercise.history.push({ date: dateStr, value: Math.floor(Math.random() * 45) });
      }
      this.saveData();
    }
    this.updateDashboardStats();
  },

  saveData() {
    localStorage.setItem('miAsistente_bienestar', JSON.stringify({
      water: this.water,
      sleep: this.sleep,
      exercise: this.exercise,
      nutrition: this.nutrition,
      weight: this.weight
    }));
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  getTodayStr() {
    return this.formatDate(new Date());
  },

  getTodayWater() {
    const today = this.getTodayStr();
    const entry = this.water.history.find(h => h.date === today);
    return entry ? entry.value : this.water.current;
  },

  getTodaySleep() {
    const today = this.getTodayStr();
    const entry = this.sleep.history.find(h => h.date === today);
    return entry ? entry.value : this.sleep.current;
  },

  getTodayExercise() {
    const today = this.getTodayStr();
    const entry = this.exercise.history.find(h => h.date === today);
    return entry ? entry.value : this.exercise.current;
  },

  renderDashboard() {
    this.renderWaterCard();
    this.renderSleepCard();
    this.renderExerciseCard();
    this.renderMiniCharts();
  },

  renderWaterCard() {
    const container = document.getElementById('water-card');
    if (!container) return;

    const current = this.getTodayWater();
    const pct = Math.min((current / this.water.target) * 100, 100);
    const glasses = Math.ceil(current / 0.25);

    container.innerHTML = `
      <div class="panel p-6">
        <header class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Hidratación</h2>
          <span class="pill pos text-xs">${current.toFixed(1)}/${this.water.target}L</span>
        </header>

        <div class="mb-6">
          <div class="w-full bg-slate-800 h-4 rounded overflow-hidden mb-2">
            <div class="h-full rounded bg-cyan-400 transition-all" style="width:${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400">
            <span>0 L</span>
            <span>${this.water.target} L</span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 mb-4">
          ${Array.from({ length: 10 }, (_, i) => i + 1).map(i => `
            <button class="water-glass ${i <= glasses ? 'filled' : ''} aspect-square rounded-xl border-2 flex items-center justify-center transition ${i <= glasses ? 'bg-cyan-400 border-cyan-400' : 'border-slate-700 hover:border-cyan-400/50'}" 
              onclick="BienestarSystem.addWater(0.25)" style="color:${i <= glasses ? '#000' : '#fff'}">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            </button>
          `).join('')}
        </div>

        <button class="btn primary w-full" onclick="BienestarSystem.addWater(0.25)">
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Beber 250 ml
        </button>

        <p class="text-xs text-slate-400 text-center mt-2">${Math.round(pct)}% de la meta diaria</p>
      </div>
    `;
  },

  renderSleepCard() {
    const container = document.getElementById('sleep-card');
    if (!container) return;

    const current = this.getTodaySleep();
    const pct = Math.min((current / this.sleep.target) * 100, 100);
    const hours = Math.floor(current);
    const mins = Math.round((current - hours) * 60);

    container.innerHTML = `
      <div class="panel p-6">
        <header class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Sueño</h2>
          <span class="pill" style="background:#06b6d422; color:#06b6d4">${hours}h ${mins}m</span>
        </header>

        <div class="mb-6">
          <div class="w-full bg-slate-800 h-4 rounded overflow-hidden mb-2">
            <div class="h-full rounded bg-cyan-400 transition-all" style="width:${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400">
            <span>0 h</span>
            <span>${this.sleep.target} h</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button class="btn" onclick="BienestarSystem.addSleep(-0.25)"><svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9"/></svg>-15 min</button>
          <button class="btn primary" onclick="BienestarSystem.addSleep(0.25)"><svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>+15 min</button>
        </div>

        <p class="text-xs text-slate-400 text-center mt-2">Meta: ${this.sleep.target}h • ${Math.round(pct)}% completado</p>
      </div>
    `;
  },

  renderExerciseCard() {
    const container = document.getElementById('exercise-card');
    if (!container) return;

    const current = this.getTodayExercise();
    const pct = Math.min((current / this.exercise.target) * 100, 100);

    container.innerHTML = `
      <div class="panel p-6">
        <header class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Ejercicio</h2>
          <span class="pill pos text-xs">${current}/${this.exercise.target} min</span>
        </header>

        <div class="mb-6">
          <div class="w-full bg-slate-800 h-4 rounded overflow-hidden mb-2">
            <div class="h-full rounded bg-emerald-400 transition-all" style="width:${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400">
            <span>0 min</span>
            <span>${this.exercise.target} min</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-4">
          <button class="btn text-xs py-2" onclick="BienestarSystem.addExercise(10)">+10 min</button>
          <button class="btn primary text-xs py-2" onclick="BienestarSystem.addExercise(30)">+30 min</button>
          <button class="btn text-xs py-2" onclick="BienestarSystem.openExerciseModal()">Registrar</button>
        </div>

        <p class="text-xs text-slate-400 text-center">${Math.round(pct)}% de la meta diaria</p>
      </div>
    `;
  },

  renderMiniCharts() {
    // Water mini chart
    this.renderMiniChart('water-mini-chart', this.water.history.slice(-7), '#06b6d4');
    this.renderMiniChart('sleep-mini-chart', this.sleep.history.slice(-7), '#8b5cf6');
    this.renderMiniChart('exercise-mini-chart', this.exercise.history.slice(-7), '#22c55e');
  },

  renderMiniChart(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 80;
    const padding = 10;

    if (data.length === 0) return;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const minVal = Math.min(...data.map(d => d.value), 0);
    const range = maxVal - minVal || 1;

    ctx.clearRect(0, 0, width, height);

    // Gradient area
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    ctx.fillStyle = color;
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  renderFullInterface() {
    this.renderWaterDetail();
    this.renderSleepDetail();
    this.renderExerciseDetail();
    this.renderNutritionDetail();
    this.bindPageEvents();
  },

  renderWaterDetail() {
    const container = document.getElementById('water-detail');
    if (!container) return;

    const today = this.getTodayWater();
    const avg = this.water.history.length ? (this.water.history.reduce((s, h) => s + h.value, 0) / this.water.history.length).toFixed(1) : 0;

    container.innerHTML = `
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2"><span class="text-2xl">💧</span> Hidratación</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-cyan-400">${today.toFixed(1)} L</p>
            <p class="text-slate-400 text-sm">Hoy</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-white">${avg} L</p>
            <p class="text-slate-400 text-sm">Promedio 7 días</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-amber-400">${this.water.history.filter(h => h.value >= this.water.target).length}/7</p>
            <p class="text-slate-400 text-sm">Días en meta</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Meta diaria (L)</label>
          <input type="number" step="0.1" min="1" max="5" value="${this.water.target}" class="input w-24" onchange="BienestarSystem.updateTarget('water', this.value)">
        </div>

        <canvas id="water-history-chart" class="w-full h-48"></canvas>
      </div>
    `;

    this.renderHistoryChart('water-history-chart', this.water.history, '#06b6d4', 'L');
  },

  renderSleepDetail() {
    const container = document.getElementById('sleep-detail');
    if (!container) return;

    const today = this.getTodaySleep();
    const avg = this.sleep.history.length ? (this.sleep.history.reduce((s, h) => s + h.value, 0) / this.sleep.history.length).toFixed(1) : 0;

    container.innerHTML = `
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2"><span class="text-2xl">😴</span> Sueño</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-purple-400">${today}h</p>
            <p class="text-slate-400 text-sm">Anoche</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-white">${avg}h</p>
            <p class="text-slate-400 text-sm">Promedio 7 días</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-emerald-400">${this.sleep.history.filter(h => h.value >= this.sleep.target).length}/7</p>
            <p class="text-slate-400 text-sm">Días en meta</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Meta diaria (horas)</label>
          <input type="number" step="0.5" min="4" max="12" value="${this.sleep.target}" class="input w-24" onchange="BienestarSystem.updateTarget('sleep', this.value)">
        </div>

        <canvas id="sleep-history-chart" class="w-full h-48"></canvas>
      </div>
    `;

    this.renderHistoryChart('sleep-history-chart', this.sleep.history, '#8b5cf6', 'h');
  },

  renderExerciseDetail() {
    const container = document.getElementById('exercise-detail');
    if (!container) return;

    const today = this.getTodayExercise();
    const totalWeek = this.exercise.history.reduce((s, h) => s + h.value, 0);
    const avg = this.exercise.history.length ? Math.round(totalWeek / this.exercise.history.length) : 0;

    container.innerHTML = `
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2"><span class="text-2xl">💪</span> Ejercicio</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-emerald-400">${today} min</p>
            <p class="text-slate-400 text-sm">Hoy</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-white">${avg} min</p>
            <p class="text-slate-400 text-sm">Promedio diario</p>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl text-center">
            <p class="text-4xl font-bold text-cyan-400">${totalWeek} min</p>
            <p class="text-slate-400 text-sm">Total semana</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Meta diaria (minutos)</label>
          <input type="number" step="5" min="10" max="120" value="${this.exercise.target}" class="input w-24" onchange="BienestarSystem.updateTarget('exercise', this.value)">
        </div>

        <canvas id="exercise-history-chart" class="w-full h-48"></canvas>

        <div class="mt-6">
          <h4 class="font-medium mb-3">Registrar entrenamiento</h4>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <select id="exercise-type" class="input"><option value="cardio">🏃 Cardio</option><option value="strength">🏋️ Fuerza</option><option value="yoga">🧘 Yoga</option><option value="walk">🚶 Caminata</option><option value="other">📦 Otro</option></select>
            <input type="number" id="exercise-duration" placeholder="Minutos" class="input" min="1" max="300">
          </div>
          <input type="text" id="exercise-notes" placeholder="Notas (opcional)" class="input mb-3">
          <button class="btn primary w-full" onclick="BienestarSystem.logExercise()">Guardar entrenamiento</button>
        </div>
      </div>
    `;

    this.renderHistoryChart('exercise-history-chart', this.exercise.history, '#22c55e', 'min');
  },

  renderNutritionDetail() {
    const container = document.getElementById('nutrition-detail');
    if (!container) return;

    container.innerHTML = `
      <div class="panel p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2"><span class="text-2xl">🍎</span> Nutrición</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-slate-800/30 p-4 rounded-xl">
            <p class="text-sm text-slate-400">Calorías consumidas</p>
            <p class="text-3xl font-bold text-white">${this.nutrition.calories} / ${this.nutrition.target} kcal</p>
            <div class="w-full bg-slate-800 h-2 rounded mt-2 overflow-hidden">
              <div class="h-full rounded bg-amber-400" style="width:${Math.min((this.nutrition.calories / this.nutrition.target) * 100, 100)}%"></div>
            </div>
          </div>
          <div class="bg-slate-800/30 p-4 rounded-xl">
            <p class="text-sm text-slate-400">Comidas hoy</p>
            <p class="text-3xl font-bold text-white">${this.nutrition.meals.filter(m => m.date === this.getTodayStr()).length}</p>
          </div>
        </div>

        <h4 class="font-medium mb-3">Agregar comida</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <select id="meal-type" class="input"><option value="breakfast">🌅 Desayuno</option><option value="lunch">☀️ Almuerzo</option><option value="dinner">🌙 Cena</option><option value="snack">🍪 Snack</option></select>
          <input type="text" id="meal-name" placeholder="Nombre" class="input">
          <input type="number" id="meal-calories" placeholder="Calorías" class="input" min="0">
          <input type="text" id="meal-macros" placeholder="P/C/G (opcional)" class="input">
        </div>
        <button class="btn primary w-full" onclick="BienestarSystem.logMeal()">Registrar comida</button>

        <div class="mt-6">
          <h4 class="font-medium mb-3">Historial de hoy</h4>
          <div id="meals-today" class="space-y-2">
            ${this.renderMealsList()}
          </div>
        </div>
      </div>
    `;
  },

  renderMealsList() {
    const today = this.getTodayStr();
    const meals = this.nutrition.meals.filter(m => m.date === today);
    if (meals.length === 0) return '<p class="text-slate-400 text-center py-4">No hay comidas registradas hoy</p>';

    return meals.map(m => `
      <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div class="flex items-center gap-3">
          <span class="text-xl">${m.type === 'breakfast' ? '🌅' : m.type === 'lunch' ? '☀️' : m.type === 'dinner' ? '🌙' : '🍪'}</span>
          <div>
            <p class="font-medium">${m.name}</p>
            <p class="text-xs text-slate-400">${m.macros || ''}</p>
          </div>
        </div>
        <span class="font-bold text-amber-400">${m.calories} kcal</span>
      </div>
    `).join('');
  },

  renderHistoryChart(canvasId, data, color, unit) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    const padding = 40;

    if (data.length === 0) return;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const minVal = Math.min(...data.map(d => d.value), 0);
    const range = maxVal - minVal || 1;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(ratio => {
      const y = padding + (1 - ratio) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    });

    // Area
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots + labels
    ctx.fillStyle = color;
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      // Date label
      ctx.fillStyle = '#949494';
      ctx.fillText(new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' }), x, height - padding + 18);
      ctx.fillStyle = color;
    });

    // Y-axis labels
    ctx.fillStyle = '#949494';
    ctx.textAlign = 'right';
    [0, 0.5, 1].forEach(ratio => {
      const val = minVal + range * ratio;
      const y = height - padding - ratio * (height - 2 * padding);
      ctx.fillText(`${val.toFixed(1)}${unit}`, padding - 8, y + 4);
    });
  },

  updateDashboardStats() {
    const waterEl = document.getElementById('water-text');
    if (waterEl) {
      const current = this.getTodayWater();
      waterEl.textContent = `${current.toFixed(1)} / ${this.water.target} L`;
    }
  },

  bindEvents() {
    document.getElementById('water-btn')?.addEventListener('click', () => this.addWater(0.25));
    document.getElementById('exercise-btn')?.addEventListener('click', () => this.addExercise(10));
  },

  bindPageEvents() {
    this.bindEvents();
  },

  addWater(amount) {
    const today = this.getTodayStr();
    let entry = this.water.history.find(h => h.date === today);
    if (entry) {
      entry.value = +(entry.value + amount).toFixed(1);
    } else {
      this.water.history.push({ date: today, value: amount });
      this.water.current = amount;
    }
    this.water.current = this.getTodayWater();
    this.saveData();
    this.renderDashboard();
    this.updateDashboardStats();
    this.showToast(`+${amount} L de agua 💧`);
  },

  addSleep(hours) {
    const today = this.getTodayStr();
    let entry = this.sleep.history.find(h => h.date === today);
    const newVal = Math.max(0, (entry?.value || this.sleep.current) + hours);
    if (entry) {
      entry.value = +newVal.toFixed(2);
    } else {
      this.sleep.history.push({ date: today, value: newVal });
      this.sleep.current = newVal;
    }
    this.sleep.current = this.getTodaySleep();
    this.saveData();
    this.renderDashboard();
    this.updateDashboardStats();
    this.showToast(`${hours > 0 ? '+' : ''}${hours * 60} min de sueño 😴`);
  },

  addExercise(minutes) {
    const today = this.getTodayStr();
    let entry = this.exercise.history.find(h => h.date === today);
    const newVal = (entry?.value || this.exercise.current) + minutes;
    if (entry) {
      entry.value = newVal;
    } else {
      this.exercise.history.push({ date: today, value: newVal });
      this.exercise.current = newVal;
    }
    this.exercise.current = this.getTodayExercise();
    this.saveData();
    this.renderDashboard();
    this.updateDashboardStats();
    this.showToast(`+${minutes} min de ejercicio 💪`);
  },

  openExerciseModal() {
    // Could open a detailed modal
    this.addExercise(30);
  },

  logExercise() {
    const type = document.getElementById('exercise-type').value;
    const duration = parseInt(document.getElementById('exercise-duration').value);
    const notes = document.getElementById('exercise-notes').value;
    if (!duration) return;

    this.addExercise(duration);
    // Could save type/notes to a separate log
    this.showToast(`Entrenamiento de ${type} registrado (${duration} min) 💪`);
    document.getElementById('exercise-duration').value = '';
    document.getElementById('exercise-notes').value = '';
    this.renderExerciseDetail();
  },

  logMeal() {
    const type = document.getElementById('meal-type').value;
    const name = document.getElementById('meal-name').value;
    const calories = parseInt(document.getElementById('meal-calories').value);
    const macros = document.getElementById('meal-macros').value;
    if (!name || !calories) return;

    this.nutrition.meals.push({
      date: this.getTodayStr(),
      type,
      name,
      calories,
      macros
    });
    this.nutrition.calories += calories;
    this.saveData();
    this.renderNutritionDetail();
    this.showToast(`${name} registrado (${calories} kcal) 🍎`);
    document.getElementById('meal-name').value = '';
    document.getElementById('meal-calories').value = '';
    document.getElementById('meal-macros').value = '';
  },

  updateTarget(type, value) {
    const num = parseFloat(value) || 0;
    if (num > 0) {
      this[type].target = num;
      this.saveData();
      this.renderDashboard();
      if (type === 'water') this.renderWaterDetail();
      else if (type === 'sleep') this.renderSleepDetail();
      else if (type === 'exercise') this.renderExerciseDetail();
    }
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 right-4 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-sm z-50 animate-slide-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  },

  logWeight() {
    const weight = parseFloat(document.getElementById('weight-input').value);
    const target = parseFloat(document.getElementById('target-input').value);
    if (!weight) return;

    const today = this.getTodayStr();
    this.weight.current = weight;
    if (target) this.weight.target = target;
    this.weight.history.push({ date: today, value: weight });
    this.saveData();
    this.renderWeightChart();
    this.renderDashboard();
    this.showToast(`Peso registrado: ${weight} kg ⚖️`);
    document.getElementById('weight-input').value = '';
  },

  renderWeightChart() {
    const canvas = document.getElementById('weight-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    const padding = 40;

    if (this.weight.history.length < 2) {
      ctx.fillStyle = '#949494';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Se necesitan al menos 2 registros', width / 2, height / 2);
      return;
    }

    const maxVal = Math.max(...this.weight.history.map(d => d.value));
    const minVal = Math.min(...this.weight.history.map(d => d.value));
    const range = maxVal - minVal || 1;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
      const y = padding + (1 - ratio) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    });

    // Area
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, '#f59e0b33');
    grad.addColorStop(1, '#f59e0b00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    this.weight.history.forEach((d, i) => {
      const x = padding + (i / (this.weight.history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.weight.history.forEach((d, i) => {
      const x = padding + (i / (this.weight.history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    ctx.fillStyle = '#f59e0b';
    this.weight.history.forEach((d, i) => {
      const x = padding + (i / (this.weight.history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Update current/target display
    const currentEl = document.getElementById('weight-current');
    const targetEl = document.getElementById('weight-target');
    const diffEl = document.getElementById('weight-diff');
    if (currentEl) currentEl.textContent = `${this.weight.current} kg`;
    if (targetEl) targetEl.textContent = this.weight.target ? `${this.weight.target} kg` : '–';
    if (diffEl && this.weight.target) {
      const diff = (this.weight.current - this.weight.target).toFixed(1);
      diffEl.textContent = `${diff > 0 ? '+' : ''}${diff} kg`;
      diffEl.style.color = diff > 0 ? '#ef4444' : '#22c55e';
    }
  },

  renderStreaks() {
    const container = document.getElementById('streaks-grid');
    if (!container) return;

    const today = this.getTodayStr();
    const waterStreak = this.calculateStreak(this.water.history, h => h.value >= this.water.target);
    const sleepStreak = this.calculateStreak(this.sleep.history, h => h.value >= this.sleep.target);
    const exerciseStreak = this.calculateStreak(this.exercise.history, h => h.value >= this.exercise.target);

    const streaks = [
      { icon: '💧', label: 'Agua', streak: waterStreak, color: '#06b6d4' },
      { icon: '😴', label: 'Sueño', streak: sleepStreak, color: '#8b5cf6' },
      { icon: '💪', label: 'Ejercicio', streak: exerciseStreak, color: '#22c55e' },
      { icon: '🎯', label: 'Meta diaria', streak: this.calculateFullDayStreak(), color: '#f59e0b' }
    ];

    container.innerHTML = streaks.map(s => `
      <div class="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 text-center">
        <div class="text-3xl mb-1">${s.icon}</div>
        <div class="text-2xl font-bold" style="color:${s.color}">${s.streak}</div>
        <div class="text-xs text-slate-400">${s.label} ${s.streak > 0 ? '🔥' : ''}</div>
      </div>
    `).join('');
  },

  calculateStreak(history, condition) {
    if (!history.length) return 0;
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const entry of sorted) {
      if (condition(entry)) streak++;
      else break;
    }
    return streak;
  },

  calculateFullDayStreak() {
    const today = this.getTodayStr();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const water = this.water.history.find(h => h.date === dateStr)?.value >= this.water.target;
      const sleep = this.sleep.history.find(h => h.date === dateStr)?.value >= this.sleep.target;
      const exercise = this.exercise.history.find(h => h.date === dateStr)?.value >= this.exercise.target;
      if (water && sleep && exercise) streak++;
      else break;
    }
    return streak;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('water-card') || document.getElementById('water-detail')) {
    BienestarSystem.init();
  }
});

window.BienestarSystem = BienestarSystem;