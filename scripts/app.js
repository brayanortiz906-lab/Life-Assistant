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
function addChatMessage(text, isUser = false, meta = {}) {
  const container = $('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${isUser ? 'user' : 'system'}`;
  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (isUser) {
    msg.innerHTML = `<div>${text}</div>`;
  } else {
    const intentBadge = meta.intent ? `<span class="intent-badge">${meta.category}:${meta.intent}</span>` : '';
    const confidence = meta.confidence ? `<span class="confidence-badge">${(meta.confidence * 100).toFixed(0)}%</span>` : '';
    msg.innerHTML = `<div class="msg-meta">Mi Asistente · ${time} ${intentBadge} ${confidence}</div><div>${text}</div>`;
  }
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// Action handlers for each category
const ActionHandlers = {
  agenda: {
    create: (params) => {
      const title = params.titulo || 'Nuevo evento';
      const time = params.hora || 'Hora por definir';
      const date = params.fecha || 'hoy';
      state.agendaEvents.push({ title, time: `${date} ${time}`, color: 'bg-indigo-500' });
      return `✅ Evento "${title}" agendado para ${date} a las ${time}.`;
    },
    list: () => {
      if (state.agendaEvents.length === 0) return '📅 No tienes eventos programados.';
      return '📅 **Tus eventos:**\n' + state.agendaEvents.map((e, i) => `${i+1}. ${e.title} — ${e.time}`).join('\n');
    },
    next: () => {
      if (state.agendaEvents.length === 0) return '📅 No hay eventos próximos.';
      const next = state.agendaEvents[0];
      return `📅 Próximo: **${next.title}** a las ${next.time}`;
    }
  },
  estudios: {
    create: (params) => {
      const course = params.curso || 'Nuevo curso';
      return `📚 Curso "${course}" creado. Ve a la página de Estudios para configurar módulos.`;
    },
    progress: (params) => {
      advanceCourse();
      return `📈 Avanzaste al módulo ${state.courseStep}. ¡Bien hecho!`;
    },
    list: () => '📚 Ve a la página de **Estudios** para ver todos tus cursos y progreso.',
    stats: () => `📊 **Estadísticas de estudio:**\n- Tiempo total: ${Math.floor(state.studyHours)}h ${Math.round((state.studyHours % 1) * 60)}m\n- Módulo actual: ${state.courseStep} de 5\n- Progreso: ${Math.round((state.courseStep / 5) * 100)}%`,
    notes: (params) => `📝 Nota guardada para ${params.tema || 'tema general'}.`,
    review: (params) => `🔁 Modo repaso activado para ${params.tema || 'tus cursos'}.`
  },
  finanzas: {
    expense: (params) => {
      const amount = params.monto || 5;
      const cat = params.categoria || 'otros';
      state.expenses += amount;
      updateKpis();
      return `💸 Gasto de **$${amount.toFixed(2)}** registrado en *${cat}*. Total: $${state.expenses.toFixed(2)}`;
    },
    income: (params) => {
      const amount = params.monto || 100;
      return `💰 Ingreso de **$${amount.toFixed(2)}** registrado. ¡Buen trabajo!`;
    },
    budget: (params) => `📊 Presupuesto para *${params.categoria || 'general'}* establecido.`,
    report: () => `📈 **Resumen financiero:**\n- Gastos totales: $${state.expenses.toFixed(2)}\n- Presupuesto disponible: $${(500 - state.expenses).toFixed(2)}\n- Ve a **Finanzas** para ver gráficos detallados.`,
    category: (params) => `🏷️ Categoría *${params.categoria || 'general'}* aplicada.`,
    export: () => '📥 Datos exportados. Revisa tu carpeta de descargas.'
  },
  bienestar: {
    water: (params) => {
      drinkWater();
      return `💧 Agua registrada: **${state.water.toFixed(1)} / 2.5 L**. ¡Mantente hidratado!`;
    },
    sleep: (params) => `😴 Sueño registrado: ${params.valor || '8h'}. ¡Buen descanso!`,
    exercise: (params) => `💪 Ejercicio: ${params.tipo || 'entrenamiento'} por ${params.duracion || '30 min'}. ¡Bien hecho!`,
    nutrition: (params) => `🍎 Comida registrada: ${params.descripcion || 'comida'}.`,
    weight: (params) => `⚖️ Peso: ${params.valor || '?'} kg.`,
    meditation: (params) => `🧘 Meditación de ${params.duracion || '10 min'} completada.`,
    stats: () => `📊 **Bienestar:**\n- Agua: ${state.water.toFixed(1)}/2.5L\n- Ejercicio: 30 min hoy\n- Ve a **Bienestar** para ver rachas y gráficos.`
  },
  tareas: {
    create: (params) => {
      incrementTasks();
      return `✅ Tarea "${params.titulo || 'Nueva tarea'}" agregada. Total: ${state.tasks}`;
    },
    complete: () => {
      incrementTasks();
      return `🎉 ¡Tarea completada! Total: ${state.tasks}`;
    },
    list: () => `📋 Tienes **${state.tasks}** tareas. Ve a la página principal para verlas.`,
    stats: () => `📈 **Productividad:**\n- Tareas completadas: ${state.tasks}\n- Rachas: Calculando...`
  },
  sistema: {
    config: () => '⚙️ Ve a configuración en el menú principal.',
    backup: () => '💾 Backup creado en localStorage.',
    restore: () => '📥 Datos restaurados.',
    help: () => `🤖 **Comandos disponibles:**
    
**Agenda:** "agendar reunión mañana 10am", "qué tengo hoy", "próximo evento"
**Estudios:** "crear curso Python", "avanzar módulo", "mis cursos", "progreso"
**Finanzas:** "gasto 15 comida", "ingreso 500 salario", "reporte gastos", "presupuesto 200 comida"
**Bienestar:** "beber agua", "dormí 8 horas", "ejercicio 30 min", "comí ensalada", "peso 70kg"
**Tareas:** "tarea revisar emails", "completé tarea", "mis tareas"
**Sistema:** "ayuda", "atajos", "backup"

**Enseñar palabras:** "aprende: [palabra] = [categoría]" (ej: "aprende: gym = bienestar")
**Ver stats:** "stats chat"`;
    shortcuts: () => `⌨️ **Atajos:**
- Enter: Enviar mensaje
- Escape: Cerrar chat
- ↑/↓: Historial (próximamente)
- /: Enfocar input`
  },
  navegacion: {
    go: (params) => {
      const dest = params.destino || '';
      const routes = {
        'inicio': 'index.html', 'dashboard': 'index.html', 'home': 'index.html',
        'agenda': 'agenda.html', 'calendario': 'agenda.html',
        'estudios': 'estudios.html', 'cursos': 'estudios.html',
        'finanzas': 'finanzas.html', 'dinero': 'finanzas.html', 'gastos': 'finanzas.html',
        'bienestar': 'bienestar.html', 'salud': 'bienestar.html', 'ejercicio': 'bienestar.html',
        'chat': '#chat'
      };
      const url = routes[dest.toLowerCase()];
      if (url) {
        if (url === '#chat') { openChat(); return '💬 Chat abierto.'; }
        return `🔗 Navegando a **${dest}**... <a href="${url}" class="text-accent underline">Ir ahora</a>`;
      }
      return `❓ No conozco "${dest}". Opciones: inicio, agenda, estudios, finanzas, bienestar.`;
    }
  }
};

// Main chat processor using ChatEngine
async function handleAiSubmit(e) {
  e.preventDefault();
  const input = $('ai-input');
  const query = input.value.trim();
  if (!query) return;

  addChatMessage(query, true);
  input.value = '';

  // Special commands
  if (query.startsWith('aprende:') || query.startsWith('aprender:')) {
    handleLearnCommand(query);
    return;
  }
  if (query === 'stats chat' || query === 'estadísticas chat') {
    showChatStats();
    return;
  }
  if (query === 'exportar palabras' || query === 'backup palabras') {
    exportChatData();
    return;
  }
  if (query.startsWith('importar:')) {
    importChatData(query);
    return;
  }
  if (query === 'corregir:') {
    // Will be handled by next message
    addChatMessage('📝 Escribe tu corrección: "no, quise decir [lo correcto]"');
    window.pendingCorrection = query;
    return;
  }

  // Process with ChatEngine
  const result = ChatEngine.process(query);

  let response = '';
  let actionTaken = false;
  let meta = { intent: result.intent, category: result.category, confidence: result.confidence };

  // Execute action
  const handler = ActionHandlers[result.category];
  if (handler && handler[result.intent]) {
    try {
      response = await handler[result.intent](result.parameters);
      actionTaken = true;
    } catch (err) {
      response = `⚠️ Error ejecutando acción: ${err.message}`;
      console.error('Action error:', err);
    }
  } else if (result.category === 'navegacion') {
    response = await ActionHandlers.navegacion.go(result.parameters);
    actionTaken = true;
  } else if (result.confidence < 0.5) {
    response = `🤔 No estoy seguro de entender. ¿Quisiste decir: **${ChatEngine.getSuggestions(query).map(s => s.keyword).join(', ')}**?`;
  } else {
    response = `💭 Entendido: «${query}». Categoría: **${result.category}**, Acción: **${result.intent || 'general'}**. ¿Quieres que ejecute algo específico?`;
  }

  setTimeout(() => {
    addChatMessage(response, false, meta);
    if (actionTaken) updateKpis();
  }, 300);
}

// Handle "aprende: palabra = categoria" command
function handleLearnCommand(query) {
  const match = query.match(/aprende[nr]?:\s*(.+?)\s*=\s*(\w+)/i);
  if (!match) {
    addChatMessage('❌ Formato: `aprende: palabra clave = categoria`\nEj: `aprende: gym = bienestar`\nCategorías: agenda, estudios, finanzas, bienestar, tareas, sistema, navegacion');
    return;
  }
  const [, keyword, category] = match;
  const validCategories = ['agenda', 'estudios', 'finanzas', 'bienestar', 'tareas', 'sistema', 'navegacion'];
  if (!validCategories.includes(category.toLowerCase())) {
    addChatMessage(`❌ Categoría inválida. Usa: ${validCategories.join(', ')}`);
    return;
  }
  ChatEngine.addCustomKeyword(category.toLowerCase(), keyword.trim());
  addChatMessage(`✅ **Aprendido:** "${keyword.trim()}" → **${category}**\nAhora cuando digas "${keyword.trim()}" entenderé que es sobre ${category}.`);
}

// Show chat engine stats
function showChatStats() {
  const stats = ChatEngine.getStats();
  addChatMessage(`📊 **Estadísticas del Chat Engine:**
- Palabras integradas: ${stats.builtinKeywords}
- Palabras personalizadas: ${stats.customKeywords}
- Categorías: ${stats.categories.join(', ')}
- Correcciones aprendidas: ${stats.learningCorrections}
- Entradas de frecuencia: ${stats.totalFrequencyEntries}`);
}

// Export chat data
function exportChatData() {
  const data = ChatEngine.exportKeywords();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `miasistente-chat-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  addChatMessage('📥 **Exportado:** Archivo JSON descargado con tus palabras personalizadas y aprendizaje.');
}

// Import chat data (simplified - in real app would use file input)
function importChatData(query) {
  addChatMessage('📤 Para importar, usa la consola: `ChatEngine.importKeywords(data)` donde data es el objeto JSON exportado.');
}

// Handle corrections
function handleCorrection(query) {
  if (window.pendingCorrection) {
    ChatEngine.learnCorrection(window.pendingCorrection, query);
    addChatMessage(`✅ **Corrección aprendida:** La próxima vez entenderé mejor.`);
    window.pendingCorrection = null;
  }
}

// Autocomplete suggestions
function showSuggestions(partial) {
  const suggestions = ChatEngine.getSuggestions(partial);
  if (suggestions.length > 0) {
    // Could show a dropdown - simplified for now
    console.log('Suggestions:', suggestions);
  }
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

  // Input handling for suggestions
  const input = $('ai-input');
  if (input) {
    input.addEventListener('input', (e) => {
      showSuggestions(e.target.value);
    });
  }
});

// Expose globally for debugging
window.MiAsistente = { state, updateKpis, ChatEngine, ActionHandlers };