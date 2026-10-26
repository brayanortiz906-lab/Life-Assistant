// Finanzas System - Expenses, Income & Budgets

const FinanzasSystem = {
  transactions: [],
  budgets: {},
  currentChartView: 'bar',
  categories: {
    expense: [
      { id: 'food', name: 'Comida', icon: '🍔', color: '#ef4444' },
      { id: 'transport', name: 'Transporte', icon: '🚌', color: '#f97316' },
      { id: 'entertainment', name: 'Entretenimiento', icon: '🎮', color: '#eab308' },
      { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#ec4899' },
      { id: 'health', name: 'Salud', icon: '💊', color: '#10b981' },
      { id: 'education', name: 'Educación', icon: '📚', color: '#6366f1' },
      { id: 'other', name: 'Otros', icon: '📦', color: '#6b7280' }
    ],
    income: [
      { id: 'salary', name: 'Salario', icon: '💰', color: '#22c55e' },
      { id: 'freelance', name: 'Freelance', icon: '💻', color: '#06b6d4' },
      { id: 'investments', name: 'Inversiones', icon: '📈', color: '#8b5cf6' },
      { id: 'other', name: 'Otros', icon: '💵', color: '#6b7280' }
    ]
  },

  init() {
    this.loadData();
    this.renderDashboard();
    this.bindEvents();
  },

  loadData() {
    const saved = localStorage.getItem('miAsistente_finanzas');
    if (saved) {
      const data = JSON.parse(saved);
      this.transactions = data.transactions || [];
      this.budgets = data.budgets || {};
    } else {
      // Sample data
      const today = new Date();
      this.transactions = [
        { id: 1, type: 'expense', amount: 12.40, category: 'food', description: 'Almuerzo', date: this.formatDate(today) },
        { id: 2, type: 'expense', amount: 5.00, category: 'transport', description: 'Metro', date: this.formatDate(today) },
        { id: 3, type: 'expense', amount: 25.00, category: 'entertainment', description: 'Cine', date: this.formatDate(new Date(today.getTime() - 86400000)) },
        { id: 4, type: 'income', amount: 1500.00, category: 'salary', description: 'Salario mensual', date: this.formatDate(new Date(today.getFullYear(), today.getMonth(), 1)) },
        { id: 5, type: 'expense', amount: 45.00, category: 'shopping', description: 'Ropa', date: this.formatDate(new Date(today.getTime() - 172800000)) }
      ];
      this.budgets = {
        food: 300,
        transport: 100,
        entertainment: 150,
        shopping: 200,
        health: 100,
        education: 200
      };
      this.saveData();
    }
    this.updateDashboardStats();
  },

  saveData() {
    localStorage.setItem('miAsistente_finanzas', JSON.stringify({
      transactions: this.transactions,
      budgets: this.budgets
    }));
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  getMonthTransactions(month = this.getCurrentMonth()) {
    return this.transactions.filter(t => t.date.startsWith(month));
  },

  getExpensesByCategory(month = this.getCurrentMonth()) {
    const expenses = this.getMonthTransactions(month).filter(t => t.type === 'expense');
    const byCat = {};
    this.categories.expense.forEach(c => byCat[c.id] = 0);
    expenses.forEach(e => byCat[e.category] = (byCat[e.category] || 0) + e.amount);
    return byCat;
  },

  getTotalExpenses(month = this.getCurrentMonth()) {
    return this.getMonthTransactions(month).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalIncome(month = this.getCurrentMonth()) {
    return this.getMonthTransactions(month).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  },

  getBalance(month = this.getCurrentMonth()) {
    return this.getTotalIncome(month) - this.getTotalExpenses(month);
  },

  renderDashboard() {
    this.renderSummaryCards();
    this.renderChart();
    this.renderRecentTransactions();
    this.renderCategoryBreakdown();
  },

  renderSummaryCards() {
    const month = this.getCurrentMonth();
    const expenses = this.getTotalExpenses(month);
    const income = this.getTotalIncome(month);
    const balance = this.getBalance(month);

    const cards = [
      { id: 'fin-income', value: `$${income.toFixed(2)}`, label: 'Ingresos', color: '#22c55e', trend: '+12%' },
      { id: 'fin-expenses', value: `$${expenses.toFixed(2)}`, label: 'Gastos', color: '#ef4444', trend: '+8%' },
      { id: 'fin-balance', value: `$${balance.toFixed(2)}`, label: 'Balance', color: balance >= 0 ? '#22c55e' : '#ef4444', trend: balance >= 0 ? 'Positivo' : 'Negativo' }
    ];

    cards.forEach(card => {
      const el = document.getElementById(card.id);
      if (el) {
        el.innerHTML = `
          <div class="kpi-label">${card.label}</div>
          <div class="kpi-value" style="color:${card.color}">${card.value}</div>
          <div class="delta ${balance >= 0 ? 'up' : 'down'}">${card.trend}</div>
        `;
      }
    });
  },

  renderChart() {
    this.toggleChartView(this.currentChartView);
  },

  renderRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;

    const recent = [...this.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

    container.innerHTML = recent.map(t => {
      const cat = [...this.categories.expense, ...this.categories.income].find(c => c.id === t.category);
      const isExpense = t.type === 'expense';
      return `
        <div class="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style="background:${cat?.color}22">${cat?.icon || '💰'}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">${t.description}</p>
            <p class="text-xs text-slate-400">${new Date(t.date).toLocaleDateString('es-ES')} · ${cat?.name || t.category}</p>
          </div>
          <div class="text-right">
            <p class="font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}">${isExpense ? '-' : '+'}$${t.amount.toFixed(2)}</p>
            <button class="text-xs text-slate-400 hover:text-white" onclick="FinanzasSystem.editTransaction(${t.id})">Editar</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCategoryBreakdown() {
    const container = document.getElementById('category-breakdown');
    if (!container) return;

    const month = this.getCurrentMonth();
    const expensesByCat = this.getExpensesByCategory(month);
    const totalExpenses = this.getTotalExpenses(month);

    container.innerHTML = this.categories.expense
      .filter(c => expensesByCat[c.id] > 0 || this.budgets[c.id])
      .map(cat => {
        const spent = expensesByCat[cat.id] || 0;
        const budget = this.budgets[cat.id] || 0;
        const pct = budget > 0 ? (spent / budget) * 100 : 0;
        const over = spent > budget && budget > 0;
        return `
          <div class="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">${cat.icon}</span>
                <span class="font-medium">${cat.name}</span>
              </div>
              <span class="font-bold ${over ? 'text-red-400' : 'text-white'}">$${spent.toFixed(2)}${budget ? ` / $${budget}` : ''}</span>
            </div>
            ${budget > 0 ? `
              <div class="w-full bg-slate-800 h-2 rounded overflow-hidden">
                <div class="h-full rounded transition-all" style="width:${Math.min(pct, 100)}%; background:${over ? '#ef4444' : cat.color}"></div>
              </div>
              <p class="text-xs text-slate-400 mt-1 text-right">${pct.toFixed(0)}% del presupuesto</p>
            ` : ''}
          </div>
        `;
      }).join('');
  },

  renderFullInterface() {
    // For separate page
    this.renderSummaryCards();
    this.renderChart();
    this.renderTransactionsTable();
    this.renderBudgetsManager();
    this.applyFilters(); // Initialize filter dropdowns
    this.bindPageEvents();
  },

  renderTransactionsTable() {
    const container = document.getElementById('transactions-table');
    if (!container) return;

    const sorted = [...this.transactions].sort((a, b) => b.date.localeCompare(a.date));

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th class="n">Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(t => {
              const cat = [...this.categories.expense, ...this.categories.income].find(c => c.id === t.category);
              const isExpense = t.type === 'expense';
              return `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('es-ES')}</td>
                  <td><span class="pill ${isExpense ? 'neg' : 'pos'} text-xs">${isExpense ? 'Gasto' : 'Ingreso'}</span></td>
                  <td><span class="flex items-center gap-1" style="color:${cat?.color}">${cat?.icon} ${cat?.name}</span></td>
                  <td>${t.description}</td>
                  <td class="n ${isExpense ? 'text-red-400' : 'text-green-400'} font-medium">${isExpense ? '-' : '+'}$${t.amount.toFixed(2)}</td>
                  <td>
                    <button class="btn text-xs p-1" onclick="FinanzasSystem.editTransaction(${t.id})">Editar</button>
                    <button class="btn text-xs p-1 text-red-400 hover:bg-red-500/10" onclick="FinanzasSystem.deleteTransaction(${t.id})">Eliminar</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderBudgetsManager() {
    const container = document.getElementById('budgets-manager');
    if (!container) return;

    const month = this.getCurrentMonth();
    const expensesByCat = this.getExpensesByCategory(month);

    container.innerHTML = this.categories.expense.map(cat => {
      const spent = expensesByCat[cat.id] || 0;
      const budget = this.budgets[cat.id] || 0;
      return `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div class="flex items-center gap-3">
            <span class="text-xl">${cat.icon}</span>
            <div>
              <p class="font-medium">${cat.name}</p>
              <p class="text-xs text-slate-400">Gastado: $${spent.toFixed(2)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" step="0.01" min="0" value="${budget}" placeholder="Presupuesto" class="input w-24 text-right" onchange="FinanzasSystem.updateBudget('${cat.id}', this.value)">
            <span class="text-slate-400 text-sm">/mes</span>
          </div>
        </div>
      `;
    }).join('');
  },

  updateDashboardStats() {
    const month = this.getCurrentMonth();
    const expenses = this.getTotalExpenses(month);
    const expenseEl = document.getElementById('expense-amount');
    if (expenseEl) expenseEl.textContent = `$${expenses.toFixed(2)}`;
  },

  bindEvents() {
    // Chart toggle buttons
    document.getElementById('chart-bar-btn')?.addEventListener('click', () => this.toggleChartView('bar'));
    document.getElementById('chart-pie-btn')?.addEventListener('click', () => this.toggleChartView('pie'));
    // Filter selects
    document.getElementById('filter-type')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('filter-category')?.addEventListener('change', () => this.applyFilters());
  },

  toggleChartView(view) {
    // view: 'bar' or 'pie'
    this.currentChartView = view;
    // Update active button state
    document.getElementById('chart-bar-btn')?.classList.toggle('active', view === 'bar');
    document.getElementById('chart-pie-btn')?.classList.toggle('active', view === 'pie');

    const canvas = document.getElementById('finance-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const month = this.getCurrentMonth();
    const expensesByCat = this.getExpensesByCategory(month);
    const cats = this.categories.expense.filter(c => expensesByCat[c.id] > 0);
    const data = cats.map(c => ({ label: c.name, value: expensesByCat[c.id], color: c.color }));
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (view === 'pie') {
      // Simple pie chart
      const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
      let startAngle = -Math.PI / 2;
      data.forEach(d => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += sliceAngle;
      });
    } else {
      // Bar chart (existing implementation)
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = 200;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const maxVal = Math.max(...Object.values(expensesByCat), 1);
      const barWidth = chartWidth / cats.length - 10;
      // Axes
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      // Bars
      cats.forEach((cat, i) => {
        const val = expensesByCat[cat.id];
        const barHeight = (val / maxVal) * chartHeight;
        const x = padding + 10 + i * (barWidth + 10);
        const y = height - padding - barHeight;
        const grad = ctx.createLinearGradient(0, y, 0, height - padding);
        grad.addColorStop(0, cat.color);
        grad.addColorStop(1, cat.color + '88');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
        // Label
        ctx.fillStyle = '#949494';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(cat.name, x + barWidth / 2, height - padding + 15);
        // Value
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px Inter';
        ctx.fillText(`$${val.toFixed(0)}`, x + barWidth / 2, y - 5);
      });
    }
  },
  applyFilters() {
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    // Populate category options based on selected type
    const catSelect = document.getElementById('filter-category');
    const cats = (type ? this.categories[type] : [...this.categories.expense, ...this.categories.income]);
    catSelect.innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option value="${c.id}" style="color:${c.color}">${c.icon} ${c.name}</option>`).join('');
    // Apply filter to transactions table
    const filtered = this.transactions.filter(t => {
      const typeMatch = type ? t.type === type : true;
      const catMatch = category ? t.category === category : true;
      return typeMatch && catMatch;
    });
    const container = document.getElementById('transactions-table');
    if (!container) return;
    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th class="n">Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => {
              const cat = [...this.categories.expense, ...this.categories.income].find(c => c.id === t.category);
              const isExpense = t.type === 'expense';
              return `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString('es-ES')}</td>
                  <td><span class="pill ${isExpense ? 'neg' : 'pos'} text-xs">${isExpense ? 'Gasto' : 'Ingreso'}</span></td>
                  <td><span class="flex items-center gap-1" style="color:${cat?.color}">${cat?.icon} ${cat?.name}</span></td>
                  <td>${t.description}</td>
                  <td class="n ${isExpense ? 'text-red-400' : 'text-green-400'} font-medium">${isExpense ? '-' : '+'}$${t.amount.toFixed(2)}</td>
                  <td>
                    <button class="btn text-xs p-1" onclick="FinanzasSystem.editTransaction(${t.id})">Editar</button>
                    <button class="btn text-xs p-1 text-red-400 hover:bg-red-500/10" onclick="FinanzasSystem.deleteTransaction(${t.id})">Eliminar</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  bindPageEvents() {
    this.bindEvents();
    document.getElementById('month-select')?.addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.renderDashboard();
      this.renderTransactionsTable();
      this.renderBudgetsManager();
    });
    document.getElementById('filter-type')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('filter-category')?.addEventListener('change', () => this.applyFilters());
    // Header action buttons
    document.querySelectorAll('[data-action="add-income"]').forEach(btn =>
      btn.addEventListener('click', () => this.openTransactionModal('income'))
    );
    document.querySelectorAll('[data-action="add-expense"]').forEach(btn =>
      btn.addEventListener('click', () => this.openTransactionModal('expense'))
    );
    document.querySelector('[data-action="show-reports"]')?.addEventListener('click', () => this.showReports());
    document.querySelector('[data-action="export-csv"]')?.addEventListener('click', () => this.exportCSV());
    // Transaction modal
    document.getElementById('transaction-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'transaction-modal-overlay') this.closeTransactionModal();
    });
    document.getElementById('close-transaction-modal')?.addEventListener('click', () => this.closeTransactionModal());
    document.getElementById('cancel-transaction-modal')?.addEventListener('click', () => this.closeTransactionModal());
    document.getElementById('transaction-form')?.addEventListener('submit', (e) => this.saveTransaction(e));
  },

  openTransactionModal(type, transaction = null) {
    const modal = document.getElementById('transaction-modal-overlay');
    const form = document.getElementById('transaction-form');
    form.reset();

    document.getElementById('trans-type').value = type;
    document.getElementById('trans-id').value = '';
    document.getElementById('trans-date').value = this.formatDate(new Date());
    document.getElementById('modal-title-fin').textContent = type === 'expense' ? 'Nuevo Gasto' : 'Nuevo Ingreso';

    // Populate categories
    const catSelect = document.getElementById('trans-category');
    const cats = this.categories[type];
    catSelect.innerHTML = cats.map(c => `<option value="${c.id}" style="color:${c.color}">${c.icon} ${c.name}</option>`).join('');

    if (transaction) {
      document.getElementById('trans-id').value = transaction.id;
      document.getElementById('trans-amount').value = transaction.amount;
      document.getElementById('trans-category').value = transaction.category;
      document.getElementById('trans-description').value = transaction.description;
      document.getElementById('trans-date').value = transaction.date;
      document.getElementById('modal-title-fin').textContent = type === 'expense' ? 'Editar Gasto' : 'Editar Ingreso';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('trans-amount').focus(), 100);
  },

  closeTransactionModal() {
    const modal = document.getElementById('transaction-modal-overlay');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  saveTransaction(e) {
    e.preventDefault();
    const id = document.getElementById('trans-id').value;
    const type = document.getElementById('trans-type').value;
    const data = {
      type,
      amount: parseFloat(document.getElementById('trans-amount').value),
      category: document.getElementById('trans-category').value,
      description: document.getElementById('trans-description').value,
      date: document.getElementById('trans-date').value
    };

    if (id) {
      const idx = this.transactions.findIndex(t => t.id == id);
      if (idx !== -1) this.transactions[idx] = { ...this.transactions[idx], ...data };
    } else {
      data.id = Date.now();
      this.transactions.push(data);
    }

    this.saveData();
    this.renderDashboard();
    this.updateDashboardStats();
    this.closeTransactionModal();
  },

  editTransaction(id) {
    const t = this.transactions.find(x => x.id === id);
    if (t) this.openTransactionModal(t.type, t);
  },

  deleteTransaction(id) {
    if (confirm('¿Eliminar esta transacción?')) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveData();
      this.renderDashboard();
      this.updateDashboardStats();
    }
  },

  updateBudget(categoryId, value) {
    const num = parseFloat(value) || 0;
    if (num > 0) {
      this.budgets[categoryId] = num;
    } else {
      delete this.budgets[categoryId];
    }
    this.saveData();
    this.renderCategoryBreakdown();
    this.renderBudgetsManager();
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

  showReports() {
    this.showToast('Función de reportes en desarrollo 📊');
  },

  exportCSV() {
    if (!this.transactions.length) {
      this.showToast('No hay transacciones para exportar');
      return;
    }
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
    const rows = this.transactions.map(t => {
      const cat = [...this.categories.expense, ...this.categories.income].find(c => c.id === t.category);
      return [
        t.date,
        t.type === 'expense' ? 'Gasto' : 'Ingreso',
        cat?.name || t.category,
        t.description,
        (t.type === 'expense' ? '-' : '+') + t.amount.toFixed(2)
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finanzas-${this.getCurrentMonth()}.csv`;
    link.click();
    this.showToast('CSV exportado ✓');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('finance-chart') || document.getElementById('transactions-table')) {
    FinanzasSystem.init();
  }
});

window.FinanzasSystem = FinanzasSystem;