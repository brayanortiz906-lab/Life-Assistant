// Agenda System - Calendar & Events Management (Improved)

const AgendaSystem = {
  events: [],
  currentDate: new Date(),
  selectedDate: null,
  viewMode: 'month', // 'month', 'week', 'day'

  init() {
    this.loadEvents();
    this.renderCalendar();
    this.bindEvents();
    this.initViewMode();
  },

  loadEvents() {
    const saved = localStorage.getItem('miAsistente_events');
    if (saved) {
      this.events = JSON.parse(saved);
    } else {
      this.events = [
        { id: 1, title: 'Reunión de Proyecto', start: '10:00', end: '11:00', date: this.formatDate(new Date()), color: '#e5484d', type: 'work' },
        { id: 2, title: 'Estudio Matemáticas', start: '14:00', end: '15:30', date: this.formatDate(new Date()), color: '#e5a93b', type: 'study' },
        { id: 3, title: 'Gimnasio', start: '18:00', end: '19:30', date: this.formatDate(new Date(Date.now() + 86400000)), color: '#c6f24e', type: 'health' }
      ];
      this.saveEvents();
    }
    this.updateDashboardCount();
  },

  saveEvents() {
    localStorage.setItem('miAsistente_events', JSON.stringify(this.events));
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  getEventsForDate(dateStr) {
    return this.events.filter(e => e.date === dateStr).sort((a, b) => a.start.localeCompare(b.start));
  },

  getEventsForMonth(year, month) {
    return this.events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  renderCalendar() {
    const container = document.getElementById('calendar-grid');
    if (!container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    const todayStr = this.formatDate(today);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthEl = document.getElementById('calendar-month');
    if (monthEl) monthEl.textContent = `${monthNames[month]} ${year}`;

    let html = '';
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(d => {
      html += `<div class="cal-day-header">${d}</div>`;
    });

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      html += `<div class="cal-day other-month" data-date="${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = this.getEventsForDate(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = this.selectedDate === dateStr;
      const hasEvents = dayEvents.length > 0;

      const eventDots = dayEvents.slice(0, 3).map(e => `<span class="cal-dot" style="background:${e.color}" title="${e.title}"></span>`).join('');
      const moreDots = dayEvents.length > 3 ? `<span class="cal-more">+${dayEvents.length - 3}</span>` : '';

      html += `
        <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}" 
             data-date="${dateStr}"
             title="${dayEvents.map(e => `${e.start}-${e.end} ${e.title}`).join('\n') || 'Sin eventos'}">
          <span class="cal-day-number">${day}</span>
          <div class="cal-events-row">
            ${eventDots}
            ${moreDots}
          </div>
        </div>
      `;
    }

    const totalCells = firstDay + daysInMonth;
    const nextMonthDays = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= nextMonthDays; day++) {
      const nextMonth = month + 1 === 12 ? 0 : month + 1;
      const nextYear = month + 1 === 12 ? year + 1 : year;
      html += `<div class="cal-day other-month" data-date="${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
    }

    container.innerHTML = html;
    this.renderEventsList();
  },

  renderEventsList() {
    const container = document.getElementById('events-list');
    if (!container) return;

    const dateStr = this.selectedDate || this.formatDate(new Date());
    const dayEvents = this.getEventsForDate(dateStr);
    const todayStr = this.formatDate(new Date());
    const isToday = dateStr === todayStr;
    const dateLabel = this.selectedDate ? new Date(this.selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoy';

    // Render upcoming events (for sidebar)
    this.renderUpcomingEvents();

    if (dayEvents.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="text-5xl mb-3 opacity-20">${isToday ? '📍' : '📅'}</div>
          <p class="text-slate-400 mb-2">No hay eventos para ${isToday ? 'hoy' : 'este día'}</p>
          <p class="text-xs text-slate-500 mb-4">Añade tu primera actividad</p>
          <button class="btn primary w-full" onclick="AgendaSystem.openEventModal()">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nuevo evento
          </button>
        </div>
      `;
      return;
    }

    const morning = dayEvents.filter(e => parseInt(e.start.split(':')[0]) < 12);
    const afternoon = dayEvents.filter(e => parseInt(e.start.split(':')[0]) >= 12 && parseInt(e.start.split(':')[0]) < 18);
    const evening = dayEvents.filter(e => parseInt(e.start.split(':')[0]) >= 18);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-sm flex items-center gap-2">
            <span class="text-lg">${isToday ? '📍 Hoy' : '📅'}</span>
            ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''} • ${dateLabel}
          </h4>
          <button class="btn text-xs" onclick="AgendaSystem.openEventModal()">
            <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nuevo
          </button>
        </div>
        
        ${this.renderTimeBlock('🌅 Mañana', morning)}
        ${this.renderTimeBlock('☀️ Tarde', afternoon)}
        ${this.renderTimeBlock('🌙 Noche', evening)}
      </div>
    `;
  },

  renderTimeBlock(title, events) {
    if (events.length === 0) return '';
    
    return `
      <div class="time-block">
        <h5 class="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">${title}</h5>
        <div class="space-y-2">
          ${events.map(e => this.renderEventCard(e)).join('')}
        </div>
      </div>
    `;
  },

  renderEventCard(event) {
    const startHour = parseInt(event.start.split(':')[0]);
    const endHour = parseInt(event.end.split(':')[0]);
    const startMin = event.start.split(':')[1];
    const endMin = event.end.split(':')[1];
    const duration = (endHour * 60 + parseInt(endMin)) - (startHour * 60 + parseInt(startMin));

    return `
      <div class="event-card group relative" onclick="AgendaSystem.editEvent(${event.id})" style="border-left: 3px solid ${event.color}">
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center" onclick="event.stopPropagation(); AgendaSystem.editEvent(${event.id})" title="Editar">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M17 11h4v4"/></svg>
          </button>
          <button class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-red-900/50 flex items-center justify-center" onclick="event.stopPropagation(); AgendaSystem.deleteEvent(${event.id})" title="Eliminar">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div class="flex items-start gap-3 p-3">
          <div class="text-xs font-mono text-slate-400 min-w-[45px] pt-0.5">${event.start}–${event.end}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-white truncate">${event.title}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="pill text-[10px] px-2 py-0.5" style="background:${event.color}22; color:${event.color}">${this.getTypeLabel(event.type)}</span>
              <span class="text-[10px] text-slate-500">${duration} min</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderUpcomingEvents() {
    const upcoming = document.getElementById('upcoming-events');
    if (!upcoming) return;

    const today = new Date();
    const todayStr = this.formatDate(today);
    const events = this.events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.start.localeCompare(b.start))
      .slice(0, 10);

    upcoming.innerHTML = events.map(e => {
      const date = new Date(e.date);
      const isToday = e.date === todayStr;
      return `
        <div class="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors" onclick="AgendaSystem.selectDate('${e.date}')">
          <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${e.color}"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">${e.title}</p>
            <p class="text-xs text-slate-400">${isToday ? 'Hoy' : date.toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'short'})} ${e.start}–${e.end}</p>
          </div>
          <span class="text-xs text-slate-500">${this.getTypeLabel(e.type)}</span>
        </div>
      `;
    }).join('') || '<p class="text-slate-400 text-center py-4">No hay eventos próximos</p>';
  },

  getTypeLabel(type) {
    const labels = { work: 'Trabajo', study: 'Estudio', health: 'Salud', personal: 'Personal', other: 'Otro' };
    return labels[type] || type;
  },

  bindEvents() {
    document.getElementById('cal-prev')?.addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('cal-next')?.addEventListener('click', () => this.navigateMonth(1));
    document.getElementById('cal-today')?.addEventListener('click', () => this.goToToday());

    document.getElementById('calendar-grid')?.addEventListener('click', (e) => {
      const dayEl = e.target.closest('.cal-day');
      if (dayEl && !dayEl.classList.contains('other-month')) {
        this.selectDate(dayEl.dataset.date);
      }
    });

    document.getElementById('add-event-btn')?.addEventListener('click', () => this.openEventModal());
    document.getElementById('event-form')?.addEventListener('submit', (e) => this.saveEvent(e));
    document.getElementById('close-event-modal')?.addEventListener('click', () => this.closeEventModal());
    document.getElementById('event-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'event-modal-overlay') this.closeEventModal();
    });

    // View mode buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => this.setViewMode(btn.dataset.view));
    });
  },

  initViewMode() {
    const saved = localStorage.getItem('agenda_view_mode');
    if (saved) this.viewMode = saved;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('agenda_view_mode', mode);
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === mode);
    });
    this.renderCalendar();
  },

  navigateMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  },

  goToToday() {
    this.currentDate = new Date();
    this.selectDate(this.formatDate(new Date()));
    this.renderCalendar();
  },

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.renderCalendar();
  },

  openEventModal(event = null) {
    const modal = document.getElementById('event-modal-overlay');
    const form = document.getElementById('event-form');
    form.reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-date').value = this.selectedDate || this.formatDate(new Date());
    document.getElementById('event-modal-title').textContent = event ? 'Editar Evento' : 'Nuevo Evento';

    if (event) {
      document.getElementById('event-id').value = event.id;
      document.getElementById('event-title').value = event.title;
      document.getElementById('event-date').value = event.date;
      document.getElementById('event-start').value = event.start;
      document.getElementById('event-end').value = event.end;
      document.getElementById('event-color').value = event.color;
      document.getElementById('event-type').value = event.type;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('event-title').focus(), 100);
  },

  closeEventModal() {
    const modal = document.getElementById('event-modal-overlay');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  saveEvent(e) {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const eventData = {
      title: document.getElementById('event-title').value,
      date: document.getElementById('event-date').value,
      start: document.getElementById('event-start').value,
      end: document.getElementById('event-end').value,
      color: document.getElementById('event-color').value,
      type: document.getElementById('event-type').value
    };

    if (id) {
      const idx = this.events.findIndex(ev => ev.id == id);
      if (idx !== -1) this.events[idx] = { ...this.events[idx], ...eventData };
    } else {
      eventData.id = Date.now();
      this.events.push(eventData);
    }

    this.saveEvents();
    this.renderCalendar();
    this.updateDashboardCount();
    this.closeEventModal();
  },

  editEvent(id) {
    const event = this.events.find(e => e.id === id);
    if (event) this.openEventModal(event);
  },

  deleteEvent(id) {
    if (confirm('¿Eliminar este evento?')) {
      this.events = this.events.filter(e => e.id !== id);
      this.saveEvents();
      this.renderCalendar();
      this.updateDashboardCount();
    }
  },

  updateDashboardCount() {
    const todayStr = this.formatDate(new Date());
    const todayEvents = this.getEventsForDate(todayStr);
    const countEl = document.getElementById('agenda-count');
    if (countEl) countEl.textContent = `${todayEvents.length} Hoy`;

    const nextEvent = todayEvents[0];
    const nextTitle = document.getElementById('next-event-title');
    const nextTime = document.getElementById('next-event-time');
    if (nextTitle && nextEvent) nextTitle.textContent = nextEvent.title;
    if (nextTime && nextEvent) nextTime.textContent = nextEvent.start;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calendar-grid')) {
    AgendaSystem.init();
  }
});

window.AgendaSystem = AgendaSystem;