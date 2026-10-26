// ============================================================
// CHAT ENGINE - Advanced Keyword/Intent System for Mi Asistente
// ============================================================

const ChatEngine = {
  // --- Configuration & State ---
  config: {
    fuzzyThreshold: 0.6,
    maxCustomKeywords: 100,
    confidenceThreshold: 0.7
  },

  // --- Core Keyword Registry (Built-in) ---
  builtInKeywords: {
    // AGENDA & TIME MANAGEMENT
    agenda: {
      category: 'agenda',
      keywords: [
        'agenda', 'calendario', 'cita', 'citas', 'evento', 'eventos',
        'reunión', 'reuniones', 'recordatorio', 'recordatorios',
        'programar', 'agendar', 'planificar', 'horario', 'horarios',
        'cita médica', 'cita doctor', 'cumpleaños', 'aniversario'
      ],
      parameters: ['fecha', 'hora', 'titulo', 'tipo', 'duracion', 'recordar'],
      intents: {
        create: ['crear', 'nuevo', 'agregar', 'añadir', 'programar', 'agendar'],
        list: ['ver', 'mostrar', 'listar', 'qué tengo', 'proximos', 'hoy', 'mañana', 'semana'],
        edit: ['editar', 'modificar', 'cambiar', 'mover', 'reprogramar'],
        delete: ['eliminar', 'borrar', 'cancelar', 'quitar'],
        next: ['próximo', 'siguiente', 'qué sigue', 'qué hay']
      }
    },

    // ESTUDIOS & LEARNING
    estudios: {
      category: 'estudios',
      keywords: [
        'estudio', 'estudios', 'estudiar', 'aprender', 'aprendizaje',
        'curso', 'cursos', 'clase', 'clases', 'lección', 'lecciones',
        'módulo', 'módulos', 'tema', 'temas', 'materia', 'materias',
        'examen', 'examenes', 'test', 'quiz', 'repaso', 'repasar',
        'tarea', 'tareas', 'deber', 'deberes', 'entrega', 'entregas',
        'biblioteca', 'apuntes', 'resumen', 'resúmenes', 'fichas'
      ],
      parameters: ['curso', 'modulo', 'tema', 'duracion', 'progreso', 'nota', 'fecha_entrega'],
      intents: {
        create: ['crear', 'nuevo', 'empezar', 'iniciar', 'matricular', 'apuntar'],
        progress: ['avanzar', 'continuar', 'progreso', 'completar', 'terminar', 'finalizar'],
        list: ['ver', 'mostrar', 'listar', 'mis cursos', 'qué estoy'],
        stats: ['estadísticas', 'stats', 'progreso', 'avance', 'tiempo'],
        notes: ['notas', 'apuntes', 'resumen', 'guardar nota', 'anotar'],
        review: ['repasar', 'revisar', 'estudiar para', 'preparar']
      }
    },

    // FINANZAS & MONEY
    finanzas: {
      category: 'finanzas',
      keywords: [
        'finanzas', 'finanza', 'dinero', 'gasto', 'gastos', 'ingreso', 'ingresos',
        'presupuesto', 'presupuestos', 'ahorro', 'ahorros', 'inversión', 'inversiones',
        'cuenta', 'cuentas', 'banco', 'tarjeta', 'efectivo', 'transferencia',
        'factura', 'facturas', 'recibo', 'recibos', 'ticket', 'tickets',
        'categoría', 'categorias', 'categoria', 'categorias',
        'comida', 'transporte', 'entretenimiento', 'compras', 'salud', 'educación', 'otros',
        'salario', 'sueldo', 'freelance', 'trabajo', 'pago', 'pagos',
        'deuda', 'deudas', 'préstamo', 'prestamo', 'interés', 'interes'
      ],
      parameters: ['monto', 'categoria', 'tipo', 'descripcion', 'fecha', 'cuenta', 'metodo_pago'],
      intents: {
        expense: ['gasto', 'gastar', 'comprar', 'pagar', 'pagué', 'pague'],
        income: ['ingreso', 'ganar', 'cobrar', 'recibir', 'cobré', 'cobre'],
        budget: ['presupuesto', 'limite', 'límite', 'meta', 'objetivo'],
        report: ['reporte', 'resumen', 'estadísticas', 'stats', 'gráfico', 'grafico', 'chart'],
        category: ['categoría', 'categoria', 'clasificar', 'etiquetar'],
        export: ['exportar', 'csv', 'excel', 'descargar', 'backup']
      }
    },

    // BIENESTAR & HEALTH
    bienestar: {
      category: 'bienestar',
      keywords: [
        'bienestar', 'salud', 'saludable', 'ejercicio', 'ejercicios', 'entrenamiento',
        'gym', 'gimnasio', 'correr', 'corrida', 'caminar', 'caminata',
        'pesas', 'fuerza', 'cardio', 'hiit', 'yoga', 'pilates', 'estirar', 'estiramientos',
        'agua', 'beber', 'hidratación', 'hidratacion', 'hidratar', 'litros', 'ml',
        'sueño', 'sueno', 'dormir', 'descansar', 'descanso', 'horas de sueño',
        'comida', 'comer', 'nutrición', 'nutricion', 'alimentación', 'alimentacion',
        'calorías', 'calorias', 'kcal', 'proteína', 'proteina', 'carbohidratos', 'grasas',
        'peso', 'pesar', 'balanza', 'kilos', 'kg', 'libras', 'lb',
        'meditación', 'meditacion', 'mindfulness', 'respiración', 'respiracion',
        'estrés', 'estres', 'ansiedad', 'relajación', 'relajacion'
      ],
      parameters: ['tipo', 'valor', 'unidad', 'fecha', 'hora', 'notas', 'intensidad'],
      intents: {
        water: ['beber agua', 'tomar agua', 'hidratar', 'registrar agua', 'agua'],
        sleep: ['dormir', 'sueño', 'sueno', 'acostar', 'despertar', 'horas dormido'],
        exercise: ['ejercicio', 'entrenar', 'entrenamiento', 'gym', 'correr', 'caminar'],
        nutrition: ['comer', 'comida', 'almuerzo', 'cena', 'desayuno', 'snack', 'merienda'],
        weight: ['pesar', 'peso', 'balanza', 'kilos', 'kg'],
        meditation: ['meditar', 'meditación', 'mindfulness', 'respirar'],
        stats: ['estadísticas', 'stats', 'progreso', 'racha', 'streak', 'historial']
      }
    },

    // TAREAS & PRODUCTIVIDAD
    tareas: {
      category: 'tareas',
      keywords: [
        'tarea', 'tareas', 'todo', 'todos', 'pendiente', 'pendientes',
        'hacer', 'completar', 'terminar', 'finalizar', 'check', 'marcar',
        'lista', 'listas', 'checklist', 'recordar', 'recordatorio',
        'urgente', 'importante', 'prioridad', 'prioridades',
        'proyecto', 'proyectos', 'meta', 'metas', 'objetivo', 'objetivos',
        'hábito', 'habito', 'hábitos', 'habitos', 'rutina', 'rutinas',
        'racha', 'streak', 'consecutivo', 'días seguidos'
      ],
      parameters: ['titulo', 'descripcion', 'prioridad', 'fecha_vencimiento', 'proyecto', 'etiquetas', 'repeticion'],
      intents: {
        create: ['crear', 'nueva', 'nuevo', 'agregar', 'añadir', 'anotar'],
        complete: ['completar', 'terminar', 'hecho', 'listo', 'check', 'marcar', 'finalizar'],
        list: ['ver', 'mostrar', 'listar', 'pendientes', 'qué tengo', 'mis tareas'],
        edit: ['editar', 'modificar', 'cambiar', 'actualizar'],
        delete: ['eliminar', 'borrar', 'quitar', 'cancelar'],
        stats: ['estadísticas', 'stats', 'completadas', 'productividad', 'racha']
      }
    },

    // SISTEMA & CONFIGURACIÓN
    sistema: {
      category: 'sistema',
      keywords: [
        'configuración', 'configuracion', 'ajustes', 'preferencias', 'opciones',
        'tema', 'temas', 'oscuro', 'claro', 'dark', 'light',
        'idioma', 'lenguaje', 'notificaciones', 'alertas', 'sonidos',
        'backup', 'respaldar', 'exportar', 'importar', 'sincronizar', 'sync',
        'ayuda', 'help', 'tutorial', 'guía', 'guia', 'cómo', 'como',
        'atajo', 'atajos', 'shortcut', 'shortcuts', 'comando', 'comandos',
        'versión', 'version', 'actualizar', 'update', 'changelog'
      ],
      parameters: ['opcion', 'valor', 'clave'],
      intents: {
        config: ['cambiar', 'modificar', 'ajustar', 'configurar'],
        backup: ['backup', 'respaldar', 'guardar copia', 'exportar datos'],
        restore: ['restaurar', 'recuperar', 'importar', 'cargar copia'],
        help: ['ayuda', 'help', 'cómo', 'como', 'explicar'],
        shortcuts: ['atajos', 'shortcuts', 'comandos', 'teclas']
      }
    },

    // NAVEGACIÓN
    navegacion: {
      category: 'navegacion',
      keywords: [
        'ir a', 'ir', 'abrir', 'abre', 'vete a', 've a', 'navegar',
        'dashboard', 'inicio', 'home', 'principal',
        'agenda', 'calendario',
        'estudios', 'cursos', 'aprender',
        'finanzas', 'dinero', 'gastos',
        'bienestar', 'salud', 'ejercicio',
        'chat', 'asistente', 'ia', 'inteligencia artificial'
      ],
      parameters: ['destino'],
      intents: {
        go: ['ir', 'abrir', 'navegar', 'vete', 've']
      }
    }
  },

  // --- Custom Keywords (User-defined, persisted in localStorage) ---
  customKeywords: {},

  // --- Learning Data ---
  learningData: {
    corrections: {},      // user corrections: "no, quise decir X"
    frequency: {},        // usage frequency for ranking
    contexts: {}          // context patterns for disambiguation
  },

  // --- Init ---
  init() {
    this.loadCustomKeywords();
    this.loadLearningData();
    this.buildSearchIndex();
  },

  // --- Persistence ---
  loadCustomKeywords() {
    try {
      const saved = localStorage.getItem('miAsistente_customKeywords');
      if (saved) this.customKeywords = JSON.parse(saved);
    } catch (e) { console.warn('Error loading custom keywords:', e); }
  },

  saveCustomKeywords() {
    try {
      localStorage.setItem('miAsistente_customKeywords', JSON.stringify(this.customKeywords));
    } catch (e) { console.warn('Error saving custom keywords:', e); }
  },

  loadLearningData() {
    try {
      const saved = localStorage.getItem('miAsistente_learningData');
      if (saved) this.learningData = JSON.parse(saved);
    } catch (e) { console.warn('Error loading learning data:', e); }
  },

  saveLearningData() {
    try {
      localStorage.setItem('miAsistente_learningData', JSON.stringify(this.learningData));
    } catch (e) { console.warn('Error saving learning data:', e); }
  },

  // --- Search Index Building ---
  buildSearchIndex() {
    this.searchIndex = {};
    // Built-in
    for (const [key, data] of Object.entries(this.builtInKeywords)) {
      for (const kw of data.keywords) {
        this.addToIndex(kw, { category: key, source: 'builtin', keywords: data.keywords, parameters: data.parameters, intents: data.intents });
      }
    }
    // Custom
    for (const [key, data] of Object.entries(this.customKeywords)) {
      for (const kw of data.keywords) {
        this.addToIndex(kw, { category: key, source: 'custom', ...data });
      }
    }
  },

  addToIndex(keyword, data) {
    const normalized = this.normalize(keyword);
    if (!this.searchIndex[normalized]) this.searchIndex[normalized] = [];
    this.searchIndex[normalized].push(data);
  },

  // --- Text Normalization ---
  normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[¿?¡!.,;:]/g, '')
      .trim();
  },

  // --- Fuzzy Matching (Levenshtein-ish) ---
  similarity(a, b) {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    const maxLen = Math.max(a.length, b.length);
    return 1 - matrix[b.length][a.length] / maxLen;
  },

  findBestMatch(input) {
    const normalized = this.normalize(input);
    let best = { score: 0, keyword: null, data: null };

    // Exact/substring match first
    for (const [idxKw, entries] of Object.entries(this.searchIndex)) {
      if (normalized.includes(idxKw) || idxKw.includes(normalized)) {
        const score = idxKw.length / Math.max(normalized.length, idxKw.length);
        if (score > best.score) {
          best = { score, keyword: idxKw, data: entries[0] };
        }
      }
    }

    // Fuzzy match if no good exact match
    if (best.score < this.config.confidenceThreshold) {
      for (const [idxKw, entries] of Object.entries(this.searchIndex)) {
        const sim = this.similarity(normalized, idxKw);
        if (sim > best.score && sim >= this.config.fuzzyThreshold) {
          best = { score: sim, keyword: idxKw, data: entries[0] };
        }
      }
    }

    return best.score > 0 ? best : null;
  },

  // --- Parameter Extraction ---
  extractParameters(text, category) {
    const params = {};
    const normalized = text.toLowerCase();

    // Amounts (money, quantities)
    const amountRegex = /(\d+[.,]?\d*)\s*(€|\$|eur|usd|pesos|mxn|cop|clp|ars|sol|soles)?/gi;
    const amounts = [...normalized.matchAll(amountRegex)];
    if (amounts.length > 0) {
      params.monto = parseFloat(amounts[0][1].replace(',', '.'));
      params.moneda = amounts[0][2] || '$';
    }

    // Time patterns
    const timeRegex = /(\d{1,2})[:h](\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/gi;
    const times = [...normalized.matchAll(timeRegex)];
    if (times.length > 0) {
      params.hora = times[0][0];
    }

    // Date patterns
    const datePatterns = [
      /hoy/gi,
      /mañana/gi,
      /pasado mañana/gi,
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g,
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/g,
      /lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo/gi
    ];
    for (const pattern of datePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        params.fecha = match[0];
        break;
      }
    }

    // Duration
    const durRegex = /(\d+)\s*(min|mins|minutos|hora|horas|h|día|dias|semana|semanas|mes|meses)/gi;
    const durMatch = normalized.match(durRegex);
    if (durMatch) params.duracion = durMatch[0];

    // Category detection for finanzas
    if (category === 'finanzas') {
      const catMap = {
        comida: ['comida', 'restaurante', 'almuerzo', 'cena', 'desayuno', 'snack', 'supermercado', 'mercado'],
        transporte: ['transporte', 'uber', 'taxi', 'bus', 'metro', 'gasolina', 'combustible', 'peaje'],
        entretenimiento: ['cine', 'netflix', 'spotify', 'juegos', 'streaming', 'diversión', 'diversion'],
        compras: ['compras', 'ropa', 'zapatos', 'amazon', 'mercadolibre', 'tienda'],
        salud: ['farmacia', 'médico', 'medico', 'doctor', 'hospital', 'medicina', 'vitaminas'],
        educacion: ['curso', 'libro', 'udemy', 'coursera', 'platzi', 'educación', 'educacion'],
        salario: ['salario', 'sueldo', 'nomina', 'nómina', 'paga'],
        freelance: ['freelance', 'cliente', 'proyecto', 'factura'],
        inversiones: ['inversión', 'inversion', 'acciones', 'cripto', 'bitcoin', 'eth', 'etf', 'fondo']
      };
      for (const [cat, kws] of Object.entries(catMap)) {
        if (kws.some(kw => normalized.includes(kw))) {
          params.categoria = cat;
          break;
        }
      }
    }

    // Category detection for bienestar
    if (category === 'bienestar') {
      if (normalized.includes('agua') || normalized.includes('beber') || normalized.includes('hidrat')) params.tipo = 'agua';
      else if (normalized.includes('dormir') || normalized.includes('sueño') || normalized.includes('sueno')) params.tipo = 'sueño';
      else if (normalized.includes('ejercicio') || normalized.includes('entrenar') || normalized.includes('gym') || normalized.includes('correr')) params.tipo = 'ejercicio';
      else if (normalized.includes('comer') || normalized.includes('comida') || normalized.includes('almorz') || normalized.includes('cen') || normalized.includes('desayun')) params.tipo = 'nutricion';
      else if (normalized.includes('pesar') || normalized.includes('peso') || normalized.includes('balanza')) params.tipo = 'peso';
      else if (normalized.includes('meditar') || normalized.includes('mindful') || normalized.includes('respir')) params.tipo = 'meditacion';
    }

    // Priority detection for tareas
    if (category === 'tareas') {
      if (normalized.includes('urgente') || normalized.includes('crítico') || normalized.includes('critico') || normalized.includes('alto')) params.prioridad = 'alta';
      else if (normalized.includes('bajo') || normalized.includes('opcional') || normalized.includes('cuando pueda')) params.prioridad = 'baja';
      else params.prioridad = 'media';
    }

    return params;
  },

  // --- Intent Classification ---
  classifyIntent(text, categoryData) {
    const normalized = this.normalize(text);
    let bestIntent = null;
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(categoryData.intents)) {
      for (const kw of keywords) {
        const normKw = this.normalize(kw);
        if (normalized.includes(normKw)) {
          const score = normKw.length / normalized.length;
          if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
          }
        }
      }
    }
    return bestIntent;
  },

  // --- Main Processing Function ---
  process(input) {
    const normalized = this.normalize(input);
    const match = this.findBestMatch(input);

    if (!match) {
      return { intent: 'unknown', category: 'general', confidence: 0, parameters: {}, raw: input };
    }

    const category = match.data.category;
    const intent = this.classifyIntent(input, match.data);
    const parameters = this.extractParameters(input, category);

    // Track usage frequency
    this.trackUsage(match.keyword, category, intent);

    return {
      intent: intent || 'general',
      category,
      confidence: match.score,
      parameters,
      matchedKeyword: match.keyword,
      raw: input
    };
  },

  trackUsage(keyword, category, intent) {
    const key = `${category}:${keyword}:${intent || 'general'}`;
    this.learningData.frequency[key] = (this.learningData.frequency[key] || 0) + 1;
    if (this.learningData.frequency[key] % 10 === 0) this.saveLearningData();
  },

  // --- Custom Keyword Management ---
  addCustomKeyword(category, keywords, metadata = {}) {
    if (!this.customKeywords[category]) {
      this.customKeywords[category] = { keywords: [], parameters: [], intents: {}, ...metadata };
    }
    const newKws = Array.isArray(keywords) ? keywords : [keywords];
    for (const kw of newKws) {
      if (!this.customKeywords[category].keywords.includes(kw)) {
        this.customKeywords[category].keywords.push(kw);
      }
    }
    this.buildSearchIndex();
    this.saveCustomKeywords();
    return true;
  },

  removeCustomKeyword(category, keyword) {
    if (this.customKeywords[category]) {
      this.customKeywords[category].keywords = this.customKeywords[category].keywords.filter(k => k !== keyword);
      if (this.customKeywords[category].keywords.length === 0) {
        delete this.customKeywords[category];
      }
      this.buildSearchIndex();
      this.saveCustomKeywords();
      return true;
    }
    return false;
  },

  // --- Learning from Corrections ---
  learnCorrection(userInput, intendedMeaning) {
    const match = this.findBestMatch(userInput);
    if (match) {
      const key = `${match.data.category}:${match.keyword}`;
      this.learningData.corrections[key] = intendedMeaning;
      this.saveLearningData();
    }
  },

  // --- Get Suggestions for Autocomplete ---
  getSuggestions(partial, limit = 5) {
    const normalized = this.normalize(partial);
    const suggestions = [];

    for (const [kw, entries] of Object.entries(this.searchIndex)) {
      if (kw.startsWith(normalized) || kw.includes(normalized)) {
        suggestions.push({
          keyword: kw,
          category: entries[0].category,
          source: entries[0].source,
          frequency: this.learningData.frequency[`${entries[0].category}:${kw}:general`] || 0
        });
      }
    }

    return suggestions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  },

  // --- Export/Import ---
  exportKeywords() {
    return {
      customKeywords: this.customKeywords,
      learningData: this.learningData,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  },

  importKeywords(data) {
    if (data.customKeywords) {
      this.customKeywords = { ...this.customKeywords, ...data.customKeywords };
    }
    if (data.learningData) {
      this.learningData = { ...this.learningData, ...data.learningData };
    }
    this.buildSearchIndex();
    this.saveCustomKeywords();
    this.saveLearningData();
  },

  // --- Debug/Inspection ---
  getStats() {
    let builtinCount = 0;
    for (const data of Object.values(this.builtInKeywords)) {
      builtinCount += data.keywords.length;
    }
    let customCount = 0;
    for (const data of Object.values(this.customKeywords)) {
      customCount += data.keywords.length;
    }
    return {
      builtinKeywords: builtinCount,
      customKeywords: customCount,
      categories: Object.keys(this.builtInKeywords).concat(Object.keys(this.customKeywords)),
      learningCorrections: Object.keys(this.learningData.corrections).length,
      totalFrequencyEntries: Object.keys(this.learningData.frequency).length
    };
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  ChatEngine.init();
  window.ChatEngine = ChatEngine; // Expose globally for debugging
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatEngine;
}