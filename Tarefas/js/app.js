import { storage } from './storage.js';
import { geminiService } from './gemini.js';
import { driveService } from './drive.js';

const state = {
  view: 'tasks',
  filter: 'all',
  period: 'Weekly',
  tasks: [],
  charts: {}
};

window.app = {
  async init() {
    // Processa recorrências ao iniciar
    state.tasks = storage.processRecurring();

    // Define data de hoje no formulário
    const dateInput = document.getElementById('new-task-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    this.renderTasks();
    this.setupEventListeners();

    console.log("App Iniciado 🚀");
  },

  setupEventListeners() {
    const form = document.getElementById('add-task-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTask();
      });
    }
  },

  // --- Lógica de View ---
  switchView(viewName) {
    state.view = viewName;
    const navs = ['tasks', 'reports'];

    navs.forEach(n => {
      const btn = document.getElementById(`nav-${n}-desktop`);
      if (btn) {
        btn.className = n === viewName
          ? "nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-brand-50 text-brand-700"
          : "nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50";
      }

      const mobBtn = document.getElementById(`nav-${n}-mobile`);
      if (mobBtn) {
        mobBtn.className = n === viewName
          ? "flex flex-col items-center text-brand-600"
          : "flex flex-col items-center text-slate-400";
      }
    });

    if (viewName === 'tasks') {
      document.getElementById('view-tasks').classList.remove('hidden');
      document.getElementById('view-reports').classList.add('hidden');
    } else {
      document.getElementById('view-tasks').classList.add('hidden');
      document.getElementById('view-reports').classList.remove('hidden');
      this.renderReports();
    }
  },

  // --- Lógica de Tarefas ---
  renderTasks() {
    const container = document.getElementById('task-list-container');
    if (!container) return;

    container.innerHTML = '';
    const filtered = state.tasks.filter(t => {
      if (state.filter === 'active') return !t.isCompleted;
      if (state.filter === 'completed') return t.isCompleted;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-slate-300 text-6xl mb-4"><i class="fas fa-clipboard-check"></i></div>
          <p class="text-slate-500">Nenhuma tarefa encontrada.</p>
        </div>`;
      return;
    }

    filtered.forEach(task => {
      const el = document.createElement('div');
      el.className = `group flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 transition-all ${task.isCompleted ? 'opacity-60' : ''}`;

      const priorityColors = {
        'Alta': 'text-red-600 bg-red-50 border-red-200',
        'Média': 'text-amber-600 bg-amber-50 border-amber-200',
        'Baixa': 'text-green-600 bg-green-50 border-green-200'
      };

      el.innerHTML = `
        <button onclick="app.toggleTask('${task.id}')" class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-500'}">
          <i class="fas fa-check text-xs"></i>
        </button>
        <div class="ml-4 flex-grow min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-slate-900 truncate ${task.isCompleted ? 'line-through text-slate-500' : ''}">${task.title}</h3>
            ${task.isRecurring ? '<i class="fas fa-sync-alt text-[10px] text-brand-500" title="Diária"></i>' : ''}
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || ''}">${task.priority}</span>
            <span class="text-xs text-slate-500 flex items-center gap-1">
              <i class="fas fa-tag text-[10px]"></i> ${task.category}
            </span>
          </div>
        </div>
        <button onclick="app.deleteTask('${task.id}')" class="ml-2 text-slate-300 hover:text-red-500 p-2 transition-colors">
          <i class="fas fa-trash-alt"></i>
        </button>`;
      container.appendChild(el);
    });
  },

  addTask() {
    const title = document.getElementById('new-task-title').value;
    const priority = document.getElementById('new-task-priority').value;
    const category = document.getElementById('new-task-category').value;
    const date = document.getElementById('new-task-date').value;
    const isRecurring = document.getElementById('new-task-recurring').checked;

    if (!title) return;

    const newTask = {
      id: crypto.randomUUID(),
      title,
      priority,
      category,
      dueDate: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
      isRecurring,
      completedAt: null
    };

    state.tasks = storage.addTask(newTask);
    this.toggleAddForm();
    this.renderTasks();
    document.getElementById('add-task-form').reset();
    document.getElementById('new-task-date').valueAsDate = new Date();
  },

  toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      task.completedAt = task.isCompleted ? new Date().toISOString() : null;
      state.tasks = storage.updateTask(task);
      this.renderTasks();
    }
  },

  deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir?')) {
      state.tasks = storage.deleteTask(id);
      this.renderTasks();
    }
  },

  filterTasks(type) {
    state.filter = type;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.className = btn.dataset.filter === type
        ? "filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-slate-900 text-white"
        : "filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-white text-slate-600 border border-slate-200";
    });
    this.renderTasks();
  },

  toggleAddForm() {
    const form = document.getElementById('add-form-container');
    form.classList.toggle('hidden');
  },

  // --- Relatórios ---
  changeReportPeriod(newPeriod) {
    state.period = newPeriod;
    document.querySelectorAll('.report-period-btn').forEach(btn => {
      btn.className = btn.dataset.period === newPeriod
        ? "report-period-btn px-4 py-1.5 text-sm font-medium rounded-md bg-brand-50 text-brand-700 shadow-sm"
        : "report-period-btn px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-900";
    });
    this.renderReports();
  },

  getFilteredTasksForReport() {
    const now = new Date();
    const start = new Date();
    if (state.period === 'Weekly') start.setDate(now.getDate() - 7);
    if (state.period === 'Monthly') start.setMonth(now.getMonth() - 1);
    if (state.period === 'Annual') start.setFullYear(now.getFullYear() - 1);
    return state.tasks.filter(t => new Date(t.createdAt) >= start);
  },

  renderReports() {
    const tasks = this.getFilteredTasksForReport();

    // KPIs
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const high = tasks.filter(t => t.isCompleted && t.priority === 'Alta').length;

        document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-completed').textContent = completed;
    document.getElementById('kpi-rate').textContent = `${rate}%`;
    document.getElementById('kpi-high').textContent = high;

    this.renderCharts(tasks);
  },

  renderCharts(tasks) {
    // Dados por categoria
    const categories = {};
    tasks.forEach(t => categories[t.category] = (categories[t.category] || 0) + 1);

    // Dados diários
    const daily = {};
    tasks.forEach(t => {
      const dateObj = new Date(t.createdAt);
      const d = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
      const label = `${weekday} (${d})`;
      daily[label] = (daily[label] || 0) + 1;
    });

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: false
    };

    // Pie Chart (categorias)
    const ctxPie = document.getElementById('chart-categories');
    if (state.charts.pie) state.charts.pie.destroy();
    state.charts.pie = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#2563eb']
        }]
      },
      options: chartConfig
    });

    // Bar Chart (atividade diária)
    const ctxBar = document.getElementById('chart-daily');
    if (state.charts.bar) state.charts.bar.destroy();
    state.charts.bar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: Object.keys(daily),
        datasets: [{
          label: 'Tarefas',
          data: Object.values(daily),
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  async generateAI() {
    const btn = document.getElementById('btn-ai-generate');
    const resultDiv = document.getElementById('ai-result');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
    resultDiv.innerHTML = '<p class="text-brand-200 animate-pulse">Consultando o Gemini AI...</p>';

    try {
      const tasks = this.getFilteredTasksForReport();
      const stats = {
        totalTasks: tasks.length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0
      };

      const report = await geminiService.generateReport(tasks, state.period, stats);

      if (report === "KEY_MISSING") {
        const newKey = prompt("Para gerar relatórios com IA, insira sua chave da API do Gemini (Google AI Studio):");
        if (newKey) {
          geminiService.setKey(newKey);
          return this.generateAI();
        } else {
          resultDiv.innerHTML = '<p class="text-red-300">Relatório cancelado: Chave API não fornecida.</p>';
          return;
        }
      }

      const formattedReport = report
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      resultDiv.innerHTML = formattedReport;

    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = '<p class="text-red-300">Ocorreu um erro ao gerar o relatório.</p>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magic"></i> Gerar Novamente';
    }
  }
};

window.onload = () => app.init();
