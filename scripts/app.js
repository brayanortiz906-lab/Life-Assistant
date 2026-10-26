// State and UI handling for Mi Asistente dashboard

// Global state object (kept for backward compatibility with dashboard KPIs)
const state = {
  tasks: 8,
  studyHours: 2.25,
  expenses: 12.40,
  water: 1.8,
  courseStep: 3,
  agendaEvents: [
    { title: 'Reunión de Proyecto', time: '10:00 – 11:00 AM', color: 'bg-rose-500' },
    { title: 'Estudio Matemáticas',   time: '14:00 – 15:30 PM', color: 'bg-amber-500' }
  ]
};

// Helper shortcut
const $ = id => document.getElementById(id);

function updateKpis() {
  const taskEl = $('task-count');
  if (taskEl) taskEl.innerText = state.tasks;

  const studyEl = $('study-time');
  if (studyEl) {
    const hrs = Math.floor(state.studyHours);
    const mins = Math.round((state.studyHours - hrs) * 60);
    studyEl.innerText = `${hrs}h ${mins}m`;
  }

  const expenseEl = $('expense-amount');
  if (expenseEl) expenseEl.innerText = `$${state.expenses.toFixed(2)}`;

  const waterEl = $('water-text');
  if (waterEl) waterEl.innerText = `${state.water.toFixed(1)} / 2.5L`;

  const stepEl = $('course-step');
  if (stepEl) stepEl.innerText = `Módulo ${state.courseStep} de 5`;

  const percentEl = $('course-percent');
  if (percentEl) percentEl.innerText = `${Math.round((state.courseStep / 5) * 100)}% Completado`;

  const barEl = $('course-bar');
  if (barEl) barEl.style.width = `${Math.round((state.courseStep / 5) * 100)}%`;
}

// KPI actions (kept for chat integration)
function incrementTasks() { state.tasks += 1; updateKpis(); }
function addStudyTime() { state.studyHours = Math.min(state.studyHours + 0.25, 3); updateKpis(); }
function addExpense() { state.expenses += 5; updateKpis(); }
function drinkWater() { state.water = Math.min(state.water + 0.25, 3); updateKpis(); }
function advanceCourse() { state.courseStep = (state.courseStep % 5) + 1; updateKpis(); }

// Chat floating modal handling
function openChat() {
  const modal = $('chat-modal');
  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setTimeout(() => { $('ai-input').focus(); }, 100);
}
function closeChat() {
  const modal = $('chat-modal');
  modal.classList.add('hidden');
}

// Chat message handling
function addChatMessage(text, isUser = false) {
  const container = $('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${isUser ? 'user' : 'system'}`;
  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (isUser) {
    msg.innerHTML = `<div>${text}</div>`;
  } else {
    msg.innerHTML = `<div class="msg-meta">Mi Asistente · ${time}</div><div>${text}</div>`;
  }
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function handleAiSubmit(e) {
  e.preventDefault();
  const input = $('ai-input');
  const query = input.value.trim();
  if (!query) return;
  
  addChatMessage(query, true);
  input.value = '';
  
  const lower = query.toLowerCase();
  let response = '';
  let actionTaken = false;
  
  if (lower.includes('agua') || lower.includes('beber')) {
    drinkWater();
    response = '¡Entendido! Registré 0.25 L de agua extra. 💧';
    actionTaken = true;
  } else if (lower.includes('tarea') || lower.includes('complet')) {
    incrementTasks();
    response = 'He incrementado el contador de tareas completadas. ✅';
    actionTaken = true;
  } else if (lower.includes('gasto') || lower.includes('comprar') || lower.includes('gast')) {
    addExpense();
    response = 'Se ha añadido $5.00 a tus gastos. 💰';
    actionTaken = true;
  } else if (lower.includes('estud') || lower.includes('curso') || lower.includes('aprend')) {
    addStudyTime();
    response = 'He añadido 15 min a tu tiempo de estudio. 📚';
    actionTaken = true;
  } else if (lower.includes('agenda') || lower.includes('evento') || lower.includes('reunión')) {
    response = 'Para gestionar tu agenda completa, ve a la página de <a href="agenda.html" class="text-accent underline">Agenda</a>. 📅';
  } else if (lower.includes('finanza') || lower.includes('dinero') || lower.includes('presupuesto')) {
    response = 'Para ver tus finanzas detalladas, ve a la página de <a href="finanzas.html" class="text-accent underline">Finanzas</a>. 💰';
  } else if (lower.includes('bienestar') || lower.includes('salud') || lower.includes('ejercicio') || lower.includes('dormir')) {
    response = 'Para tracking de bienestar, ve a la página de <a href="bienestar.html" class="text-accent underline">Bienestar</a>. 💪';
  } else if (lower.includes('estudio') || lower.includes('curso') || lower.includes('aprend')) {
    response = 'Para gestionar tus estudios, ve a la página de <a href="estudios.html" class="text-accent underline">Estudios</a>. 📚';
  } else if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) {
    response = '¡Hola! ¿En qué te puedo ayudar hoy? 😊';
  } else if (lower.includes('gracias') || lower.includes('thanks')) {
    response = '¡De nada! Estoy aquí para lo que necesites. 🙌';
  } else {
    response = `Entendido: «${query}». He tomado nota y ajustado tus prioridades. ¿Algo más en lo que te ayude?`;
  }
  
  setTimeout(() => {
    addChatMessage(response);
    if (actionTaken) updateKpis();
  }, 500);
}

// Initialise UI on load
document.addEventListener('DOMContentLoaded', () => {
  updateKpis();
  
  // Close chat modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeChat();
    }
  });
});