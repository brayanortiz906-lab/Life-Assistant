// Estudios System - Courses & Learning Progress

const EstudiosSystem = {
  courses: [],
  currentCourse: null,

  init() {
    this.loadCourses();
    this.renderCourses();
    this.bindEvents();
  },

  loadCourses() {
    const saved = localStorage.getItem('miAsistente_courses');
    if (saved) {
      this.courses = JSON.parse(saved);
    } else {
      this.courses = [
        {
          id: 1,
          title: 'Prompt Engineering',
          description: 'Domina el arte de crear prompts efectivos para IA generativa',
          category: 'IA',
          progress: 60,
          totalModules: 5,
          currentModule: 3,
          modules: [
            { id: 1, title: 'Fundamentos de Prompting', completed: true, duration: '45 min' },
            { id: 2, title: 'Técnicas Avanzadas', completed: true, duration: '60 min' },
            { id: 3, title: 'Chain of Thought & Few-shot', completed: false, duration: '75 min' },
            { id: 4, title: 'RAG & Context Engineering', completed: false, duration: '90 min' },
            { id: 5, title: 'Proyecto Final: Asistente IA', completed: false, duration: '120 min' }
          ],
          color: '#6366f1',
          lastAccessed: new Date().toISOString()
        },
        {
          id: 2,
          title: 'TypeScript Avanzado',
          description: 'Tipos avanzados, generics, utility types y patrones de diseño',
          category: 'Programación',
          progress: 25,
          totalModules: 8,
          currentModule: 2,
          modules: [
            { id: 1, title: 'Sistema de Tipos', completed: true, duration: '50 min' },
            { id: 2, title: 'Generics & Constraints', completed: false, duration: '65 min' },
            { id: 3, title: 'Utility Types', completed: false, duration: '45 min' },
            { id: 4, title: 'Conditional Types', completed: false, duration: '60 min' },
            { id: 5, title: 'Template Literal Types', completed: false, duration: '40 min' },
            { id: 6, title: 'Mapped Types', completed: false, duration: '55 min' },
            { id: 7, title: 'Type Guards & Narrowing', completed: false, duration: '50 min' },
            { id: 8, title: 'Proyecto: Librería Tipada', completed: false, duration: '120 min' }
          ],
          color: '#3178c6',
          lastAccessed: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          title: 'Diseño de Sistemas Distribuidos',
          description: 'Arquitectura, patrones, escalabilidad y tolerancia a fallos',
          category: 'Arquitectura',
          progress: 0,
          totalModules: 6,
          currentModule: 1,
          modules: [
            { id: 1, title: 'Fundamentos de Sistemas Distribuidos', completed: false, duration: '60 min' },
            { id: 2, title: 'CAP Theorem & Consistencia', completed: false, duration: '70 min' },
            { id: 3, title: 'Message Queues & Event Streaming', completed: false, duration: '80 min' },
            { id: 4, title: 'Service Mesh & Observabilidad', completed: false, duration: '75 min' },
            { id: 5, title: 'Database Sharding & Replication', completed: false, duration: '85 min' },
            { id: 6, title: 'Caso de Estudio: Arquitectura Real', completed: false, duration: '120 min' }
          ],
          color: '#059669',
          lastAccessed: null
        }
      ];
      this.saveCourses();
    }
    this.updateDashboardStats();
  },

  saveCourses() {
    localStorage.setItem('miAsistente_courses', JSON.stringify(this.courses));
  },

  renderCourses() {
    this.renderCoursesList(this.courses);
  },
  renderCoursesList(list) {
    const container = document.getElementById('courses-grid');
    if (!container) return;
    container.innerHTML = list.map(course => `
      <article class="course-card panel p-6 hover:border-accent/50 transition-colors" data-course-id="${course.id}">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="pill" style="background:${course.color}22; color:${course.color}">${course.category}</span>
              <span class="text-xs text-slate-400">${course.progress}% completado</span>
            </div>
            <h3 class="font-semibold text-lg truncate">${course.title}</h3>
            <p class="text-sm text-slate-400 mt-1 line-clamp-2">${course.description}</p>
          </div>
          <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${course.color}22">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:${course.color}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253v-13Z"/></svg>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-400">Módulo ${course.currentModule} de ${course.totalModules}</span>
            <span class="font-medium" style="color:${course.color}">${course.progress}%</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded overflow-hidden">
            <div class="h-full rounded" style="width:${course.progress}%; background:${course.color}; transition:width .3s ease"></div>
          </div>
        </div>

        <!-- Next module -->
        ${(() => {
          const nextModule = course.modules.find(m => !m.completed);
          if (nextModule) {
            return `
          <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl mb-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${course.color}22">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:${course.color}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-white">${nextModule.title}</p>
                <p class="text-xs text-slate-400">${nextModule.duration}</p>
              </div>
            </div>
            <button class="btn primary text-xs px-3 py-1.5" onclick="event.stopPropagation(); EstudiosSystem.continueCourse(${course.id})">Continuar</button>
          </div>
            `;
          } else {
            return `
          <div class="flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium">
            ✓ Curso completado
          </div>
            `;
          }
        })()}

        <!-- Modules list -->
        <details class="modules-list">
          <summary class="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer mb-2">
            Ver módulos (${course.modules.filter(m => m.completed).length}/${course.totalModules})
            <svg class="h-4 w-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </summary>
          <div class="space-y-2 pt-2 border-t border-slate-800">
            ${course.modules.map((m, i) => `
              <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition ${m.completed ? 'opacity-60' : ''} ${!m.completed && i === course.currentModule - 1 ? 'bg-accent/10 border border-accent/20' : ''}">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}" style="color:white">
                  ${m.completed ? '<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : `<span class="text-xs font-bold">${i + 1}</span>`}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm ${m.completed ? 'line-through text-slate-400' : 'text-white'} truncate">${m.title}</p>
                  <p class="text-xs text-slate-500">${m.duration}</p>
                </div>
                ${!m.completed && i === course.currentModule - 1 ? '<span class="pill pos text-xs">Siguiente</span>' : ''}
              </div>
            `).join('')}
          </div>
        </details>
      </article>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },
  applyCourseFilter(filter) {
    let filtered;
    switch(filter) {
      case 'completed':
        filtered = this.courses.filter(c => c.progress === 100);
        break;
      case 'not-started':
        filtered = this.courses.filter(c => c.progress === 0);
        break;
      case 'in-progress':
        filtered = this.courses.filter(c => c.progress > 0 && c.progress < 100);
        break;
      default:
        filtered = this.courses;
    }
    this.renderCoursesList(filtered);
  },

  renderCourseDetail(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    this.currentCourse = course;
    const container = document.getElementById('course-detail');
    if (!container) return;

    container.innerHTML = `
      <div class="panel p-6">
        <button class="btn mb-4" onclick="EstudiosSystem.showCoursesList()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Volver a cursos
        </button>

        <header class="mb-6">
          <span class="pill mb-2" style="background:${course.color}22; color:${course.color}">${course.category}</span>
          <h2 class="text-2xl font-bold mb-2">${course.title}</h2>
          <p class="text-slate-400">${course.description}</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-4">
            ${course.modules.map((m, i) => `
              <button class="module-item flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-accent/50 transition w-full text-left ${m.completed ? 'opacity-70' : ''} ${!m.completed && i === course.currentModule - 1 ? 'border-accent bg-accent/5' : ''}" onclick="EstudiosSystem.openModule(${course.id}, ${m.id})">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${m.completed ? 'bg-emerald-500/20' : 'bg-slate-800'}">
                  ${m.completed ? '<svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : `<span class="font-bold text-lg">${i + 1}</span>`}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium ${m.completed ? 'line-through text-slate-400' : 'text-white'}">${m.title}</p>
                  <p class="text-xs text-slate-400">${m.duration} • ${m.completed ? 'Completado' : i === course.currentModule - 1 ? 'En progreso' : 'Pendiente'}</p>
                </div>
                ${!m.completed && i === course.currentModule - 1 ? '<span class="pill pos text-xs">Continuar</span>' : m.completed ? '<span class="pill pos text-xs">✓ Hecho</span>' : '<span class="pill text-xs">Bloqueado</span>'}
              </button>
            `).join('')}
          </div>

          <div class="space-y-4">
            <div class="panel p-4">
              <h4 class="font-medium mb-3">Tu progreso</h4>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span>Completado</span>
                    <span class="font-bold" style="color:${course.color}">${course.progress}%</span>
                  </div>
                  <div class="w-full bg-slate-800 h-3 rounded overflow-hidden">
                    <div class="h-full rounded" style="width:${course.progress}%; background:${course.color}"></div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-center">
                  <div class="bg-slate-800/50 p-3 rounded-xl"><p class="text-2xl font-bold" style="color:${course.color}">${course.modules.filter(m => m.completed).length}</p><p class="text-xs text-slate-400">Módulos hechos</p></div>
                  <div class="bg-slate-800/50 p-3 rounded-xl"><p class="text-2xl font-bold text-white">${course.totalModules}</p><p class="text-xs text-slate-400">Total módulos</p></div>
                  <div class="bg-slate-800/50 p-3 rounded-xl"><p class="text-2xl font-bold text-cyan-400">${course.modules.slice(0, course.currentModule).reduce((acc, m) => acc + parseInt(m.duration), 0)} min</p><p class="text-xs text-slate-400">Tiempo invertido</p></div>
                  <div class="bg-slate-800/50 p-3 rounded-xl"><p class="text-2xl font-bold text-amber-400">${course.modules.slice(course.currentModule - 1).reduce((acc, m) => acc + parseInt(m.duration), 0)} min</p><p class="text-xs text-slate-400">Tiempo restante</p></div>
                </div>
              </div>
            </div>

            <div class="panel p-4">
              <h4 class="font-medium mb-3">Acciones</h4>
              <div class="space-y-2">
                <button class="btn primary w-full" onclick="EstudiosSystem.continueCourse(${course.id})">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  Continuar aprendiendo
                </button>
                <button class="btn w-full" onclick="EstudiosSystem.generateSummary(${course.id})">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Resumen IA del curso
                </button>
                <button class="btn w-full" onclick="EstudiosSystem.exportProgress(${course.id})">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Exportar progreso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hide courses list, show detail
    document.getElementById('courses-grid')?.classList.add('hidden');
    container.classList.remove('hidden');
  },

  showCoursesList() {
    document.getElementById('courses-grid')?.classList.remove('hidden');
    document.getElementById('course-detail')?.classList.add('hidden');
    this.currentCourse = null;
  },

  continueCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    const nextModule = course.modules.find(m => !m.completed);
    if (nextModule) {
      this.openModule(courseId, nextModule.id);
    }
  },

  openModule(courseId, moduleId) {
    const course = this.courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!course || !module) return;

    // Mark as in progress
    course.currentModule = course.modules.indexOf(module) + 1;
    course.lastAccessed = new Date().toISOString();
    this.saveCourses();

    // Show modal with module content
    this.showModuleModal(course, module);
  },

  showModuleModal(course, module) {
    const modal = document.getElementById('module-modal');
    const content = document.getElementById('module-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="panel p-6 max-w-2xl">
        <header class="flex items-start justify-between mb-6">
          <div>
            <span class="pill text-xs mb-2" style="background:${course.color}22; color:${course.color}">${course.category}</span>
            <h3 class="text-xl font-bold">${module.title}</h3>
            <p class="text-slate-400 text-sm mt-1">${course.title} • Módulo ${course.modules.indexOf(module) + 1} de ${course.totalModules}</p>
          </div>
          <button class="btn" onclick="EstudiosSystem.closeModuleModal()"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </header>

        <div class="prose prose-invert max-w-none space-y-4">
          <div class="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
            <h4 class="font-medium mb-2">Contenido del módulo</h4>
            <p class="text-slate-300">${this.getModuleContent(course.title, module.title)}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button class="btn primary" onclick="EstudiosSystem.completeModule(${course.id}, ${module.id})">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Marcar como completado
            </button>
            <button class="btn" onclick="EstudiosSystem.generateModuleSummary(${course.id}, ${module.id})">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Resumen IA
            </button>
          </div>

          <div class="pt-4 border-t border-slate-700/50">
            <h4 class="font-medium mb-2">Notas personales</h4>
            <textarea class="input w-full min-h-[120px] resize-y" placeholder="Toma notas mientras aprendes..." id="module-notes-${module.id}">${module.notes || ''}</textarea>
            <button class="btn text-xs mt-2" onclick="EstudiosSystem.saveNotes(${course.id}, ${module.id})">Guardar notas</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeModuleModal() {
    const modal = document.getElementById('module-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  completeModule(courseId, moduleId) {
    const course = this.courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!course || !module) return;

    module.completed = true;

    // Find next incomplete module
    const nextIncomplete = course.modules.find(m => !m.completed);
    if (nextIncomplete) {
      course.currentModule = course.modules.indexOf(nextIncomplete) + 1;
    } else {
      course.currentModule = course.totalModules; // All done
    }

    course.progress = Math.round((course.modules.filter(m => m.completed).length / course.totalModules) * 100);
    course.lastAccessed = new Date().toISOString();

    this.saveCourses();
    this.renderCourses();
    this.updateDashboardStats();
    this.closeModuleModal();

    // Show celebration
    this.showToast('¡Módulo completado! 🎉');
  },

  getModuleContent(courseTitle, moduleTitle) {
    // Simulated content - in real app would come from CMS
    const contents = {
      'Fundamentos de Prompting': 'Aprende los principios básicos de cómo funcionan los LLMs y cómo estructurar prompts claros y efectivos. Cubre: roles, contexto, formato de salida, y ejemplos básicos.',
      'Técnicas Avanzadas': 'Profundiza en few-shot prompting, chain-of-thought, self-consistency, y técnicas de reasoning. Incluye ejercicios prácticos con GPT-4 y Claude.',
      'Chain of Thought & Few-shot': 'Domina el reasoning paso a paso y la selección inteligente de ejemplos. Aprende a decomponer problemas complejos.',
      'RAG & Context Engineering': 'Implementa Retrieval-Augmented Generation, chunking strategies, embedding models, y optimización de contexto para producción.',
      'Proyecto Final: Asistente IA': 'Construye un asistente IA completo con memoria, herramientas, y evaluación automática. Proyecto listo para portfolio.',
      'Sistema de Tipos': 'Entiende el sistema de tipos estructural de TypeScript, inference, widening/narrowing, y type compatibility.',
      'Generics & Constraints': 'Crea código reutilizable y type-safe con generics, constraints, default types, y variance.',
      'Fundamentos de Sistemas Distribuidos': 'CAP theorem, consistencia, disponibilidad, partición de red. Modelos de consistencia: fuerte, eventual, causal.'
    };
    return contents[moduleTitle] || `Contenido detallado para "${moduleTitle}" en el curso "${courseTitle}". Incluye teoría, ejemplos prácticos, ejercicios y recursos adicionales.`;
  },

  generateModuleSummary(courseId, moduleId) {
    const course = this.courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!course || !module) return;

    this.showToast('Generando resumen con IA... 🤖');
    setTimeout(() => {
      const summary = `**Resumen IA: ${module.title}**

**Conceptos clave:**
• Definición y principios fundamentales
• Mejores prácticas y patrones comunes
• Errores típicos y cómo evitarlos
• Aplicación en proyectos reales

**Ejercicio sugerido:** Implementa un ejemplo práctico aplicando lo aprendido.

**Próximos pasos:** Continúa con el siguiente módulo para profundizar.`;
      this.showModal('Resumen IA', summary);
    }, 1500);
  },

  generateSummary(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    this.showToast('Generando resumen completo del curso... 🤖');
    setTimeout(() => {
      const completed = course.modules.filter(m => m.completed).length;
      const summary = `**Resumen IA: ${course.title}** (${course.progress}% completado)

**Progreso:** ${completed}/${course.totalModules} módulos

**Lo que has aprendido:**
${course.modules.filter(m => m.completed).map(m => `✓ ${m.title}`).join('\n')}

**Próximos temas:**
${course.modules.filter(m => !m.completed).slice(0, 3).map(m => `→ ${m.title}`).join('\n')}

**Recomendación:** Dedica 30-45 min diarios para mantener el ritmo. El módulo actual (${course.modules[course.currentModule - 1]?.title}) requiere práctica hands-on.`;
      this.showModal('Resumen del Curso', summary);
    }, 1500);
  },

  exportProgress(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    const data = {
      course: course.title,
      category: course.category,
      progress: `${course.progress}%`,
      completedModules: course.modules.filter(m => m.completed).map(m => m.title),
      pendingModules: course.modules.filter(m => !m.completed).map(m => m.title),
      totalTime: course.modules.reduce((acc, m) => acc + parseInt(m.duration), 0) + ' min',
      exportDate: new Date().toLocaleDateString('es-ES')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progreso-${course.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Progreso exportado 📁');
  },

  saveNotes(courseId, moduleId) {
    const course = this.courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    const textarea = document.getElementById(`module-notes-${moduleId}`);
    if (module && textarea) {
      module.notes = textarea.value;
      this.saveCourses();
      this.showToast('Notas guardadas 💾');
    }
  },

  showAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => document.getElementById('new-course-title')?.focus(), 100);
    }
  },

  closeAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    const form = document.getElementById('add-course-form');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (form) form.reset();
  },

  saveNewCourse(e) {
    e.preventDefault();
    const title = document.getElementById('new-course-title').value;
    const description = document.getElementById('new-course-desc').value;
    const category = document.getElementById('new-course-category').value;
    const color = document.getElementById('new-course-color').value;
    const modulesText = document.getElementById('new-course-modules').value;

    if (!title || !modulesText.trim()) {
      this.showToast('Completa al menos el título y un módulo');
      return;
    }

    const modules = modulesText.trim().split('\n').map((line, i) => {
      const parts = line.split('|').map(s => s.trim());
      return {
        id: i + 1,
        title: parts[0] || `Módulo ${i + 1}`,
        completed: false,
        duration: parts[1] || '60 min'
      };
    });

    const newCourse = {
      id: Date.now(),
      title,
      description,
      category,
      color,
      progress: 0,
      totalModules: modules.length,
      currentModule: 1,
      modules,
      lastAccessed: null
    };

    this.courses.push(newCourse);
    this.saveCourses();
    this.renderCourses();
    this.updateDashboardStats();
    this.closeAddCourseModal();
    this.showToast(`Curso "${title}" creado ✨`);
  },

  showModal(title, content) {
    const modal = document.getElementById('summary-modal');
    const body = document.getElementById('summary-content');
    if (!modal || !body) return;

    body.innerHTML = `<h3 class="text-lg font-bold mb-4">${title}</h3><div class="prose prose-invert max-w-none whitespace-pre-wrap">${content}</div>`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeSummaryModal() {
    const modal = document.getElementById('summary-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 right-4 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-sm z-50 animate-slide-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  },

  updateDashboardStats() {
    const totalCourses = this.courses.length;
    const activeCourses = this.courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const avgProgress = this.courses.length > 0
      ? Math.round(this.courses.reduce((sum, c) => sum + c.progress, 0) / this.courses.length)
      : 0;
    const totalModules = this.courses.reduce((sum, c) => sum + c.totalModules, 0);
    const totalHours = Math.round(this.courses.reduce((sum, c) =>
      sum + c.modules.reduce((mSum, m) => mSum + parseInt(m.duration), 0), 0) / 60);

    const totalCoursesEl = document.getElementById('total-courses');
    const totalProgressEl = document.getElementById('total-progress');
    const totalModulesEl = document.getElementById('total-modules');
    const totalHoursEl = document.getElementById('total-hours');

    if (totalCoursesEl) totalCoursesEl.textContent = activeCourses;
    if (totalProgressEl) totalProgressEl.textContent = `${avgProgress}%`;
    if (totalModulesEl) totalModulesEl.textContent = totalModules;
    if (totalHoursEl) totalHoursEl.textContent = `${totalHours}h`;
  },

  bindEvents() {
    document.getElementById('close-summary-modal')?.addEventListener('click', () => this.closeSummaryModal());
    document.getElementById('summary-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'summary-modal') this.closeSummaryModal();
    });
    document.getElementById('module-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'module-modal') this.closeModuleModal();
    });
    document.getElementById('add-course-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'add-course-modal') this.closeAddCourseModal();
    });
    document.getElementById('add-course-btn')?.addEventListener('click', () => this.showAddCourseModal());
    document.getElementById('close-add-course-modal')?.addEventListener('click', () => this.closeAddCourseModal());
    document.getElementById('cancel-add-course-modal')?.addEventListener('click', () => this.closeAddCourseModal());
    document.getElementById('add-course-form')?.addEventListener('submit', (e) => this.saveNewCourse(e));
    // Filter tab click handlers
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.applyCourseFilter(filter);
        // update active class
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('courses-grid')) {
    EstudiosSystem.init();
  }
});

window.EstudiosSystem = EstudiosSystem;