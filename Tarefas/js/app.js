import { storage } from './storage.js';
import { geminiService } from './gemini.js';
import { driveService } from './drive.js';

// Estado Global da Aplicação
const state = {
    view: 'tasks', // 'tasks' | 'reports'
    filter: 'all', // 'all' | 'active' | 'completed'
    period: 'Weekly', // 'Weekly' | 'Monthly' | 'Annual'
    tasks: [],
    charts: {} // Armazena instâncias do Chart.js
};

// Objeto App Principal
window.app = {
    async init() {
        // Processa recorrências ao iniciar
        state.tasks = storage.processRecurring();
        
        // Define data de hoje no formulário
        const dateInput = document.getElementById('new-task-date');
        if(dateInput) dateInput.valueAsDate = new Date();

        this.renderTasks();
        this.setupEventListeners();

        // Tenta inicializar drive se já houver config
        if (driveService.getConfig()) {
            try {
                await driveService.init();
                console.log("Drive Initialized");
            } catch (e) {
                console.error("Drive Init Fail", e);
            }
        }
        
        console.log("App Iniciado 🚀");
    },

    setupEventListeners() {
        const form = document.getElementById('add-task-form');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTask();
            });
        }
    },

    // --- Lógica de View ---
    switchView(viewName) {
        state.view = viewName;
        
        // Toggle Nav Classes
        const navs = ['tasks', 'reports'];
        navs.forEach(n => {
            // Desktop
            const btn = document.getElementById(`nav-${n}-desktop`);
            if (btn) {
                if (n === viewName) {
                    btn.className = "nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-brand-50 text-brand-700";
                } else {
                    btn.className = "nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50";
                }
            }

            // Mobile
            const mobBtn = document.getElementById(`nav-${n}-mobile`);
            if (mobBtn) {
                if (n === viewName) {
                    mobBtn.className = "flex flex-col items-center text-brand-600";
                } else {
                    mobBtn.className = "flex flex-col items-center text-slate-400";
                }
            }
        });

        // Toggle Content Sections
        if (viewName === 'tasks') {
            document.getElementById('view-tasks').classList.remove('hidden');
            document.getElementById('view-reports').classList.add('hidden');
        } else {
            document.getElementById('view-tasks').classList.add('hidden');
            document.getElementById('view-reports').classList.remove('hidden');
            this.renderReports(); // Renderiza gráficos ao entrar na aba
        }
    },

    // --- Lógica de Tarefas ---
    renderTasks() {
        const container = document.getElementById('task-list-container');
        if(!container) return;
        
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
                </div>
            `;
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
                        ${task.isRecurring ? '<i class="fas fa-sync-alt text-[10px] text-blue-500" title="Diária"></i>' : ''}
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
                </button>
            `;
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
        
        // Reset form
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
        if(confirm('Tem certeza que deseja excluir?')) {
            state.tasks = storage.deleteTask(id);
            this.renderTasks();
        }
    },

    filterTasks(type) {
        state.filter = type;
        
        // Atualiza botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if(btn.dataset.filter === type) {
                btn.className = "filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-slate-900 text-white";
            } else {
                btn.className = "filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-white text-slate-600 border border-slate-200";
            }
        });

        this.renderTasks();
    },

    toggleAddForm() {
        const form = document.getElementById('add-form-container');
        form.classList.toggle('hidden');
    },

    // --- Lógica de Drive (Nuvem) ---
    async connectDrive() {
        if (!driveService.getConfig()) {
            const clientId = prompt("Insira seu Google Client ID:");
            if (!clientId) return;
            const apiKey = prompt("Insira sua Google API Key:");
            if (!apiKey) return;
            driveService.saveConfig(clientId, apiKey);
            await driveService.init();
        }

        try {
            await driveService.connect();
            this.updateDriveUI(true);
            alert("Conectado ao Google Drive!");
        } catch (e) {
            console.error(e);
            alert("Erro ao conectar. Verifique o console.");
        }
    },

    async uploadToDrive() {
        if(confirm("Deseja substituir o backup na nuvem pelas tarefas atuais?")) {
            try {
                await driveService.upload(state.tasks);
                alert("Backup salvo com sucesso!");
            } catch (e) {
                alert("Erro ao salvar no Drive.");
            }
        }
    },

    async restoreFromDrive() {
        if(confirm("Isso substituirá suas tarefas locais pelo backup da nuvem. Continuar?")) {
            try {
                const tasks = await driveService.download();
                if(tasks) {
                    state.tasks = tasks;
                    storage.saveTasks(tasks);
                    // Reprocessa recorrências caso o backup seja antigo
                    state.tasks = storage.processRecurring();
                    this.renderTasks();
                    alert("Dados restaurados com sucesso!");
                } else {
                    alert("Nenhum backup encontrado.");
                }
            } catch (e) {
                alert("Erro ao baixar do Drive.");
            }
        }
    },

    disconnectDrive() {
        driveService.disconnect();
        this.updateDriveUI(false);
    },

    updateDriveUI(isConnected) {
        const btnConnect = document.getElementById('btn-drive-connect');
        const controls = document.getElementById('drive-controls');
        const navMobile = document.getElementById('nav-drive-mobile');
        
        if (isConnected) {
            btnConnect.classList.add('hidden');
            controls.classList.remove('hidden');
            if(navMobile) navMobile.classList.add('text-brand-600');
        } else {
            btnConnect.classList.remove('hidden');
            controls.classList.add('hidden');
            if(navMobile) navMobile.classList.remove('text-brand-600');
        }
    },

    handleMobileDriveAction() {
        // Atalho simples para mobile: se conectado, pergunta upload, se não, conecta
        if (driveService.isConnected) {
            this.uploadToDrive();
        } else {
            this.connectDrive();
        }
    },

    // --- Import/Export Local ---
    exportData() {
        const dataStr = JSON.stringify(state.tasks, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_tarefas_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    importData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const tasks = JSON.parse(e.target.result);
                if (Array.isArray(tasks)) {
                    state.tasks = tasks;
                    storage.saveTasks(tasks);
                    // Processa recorrencia
                    state.tasks = storage.processRecurring();
                    this.renderTasks();
                    alert("Importação concluída!");
                } else {
                    alert("Formato de arquivo inválido.");
                }
            } catch (err) {
                alert("Erro ao ler o arquivo JSON.");
            }
        };
        reader.readAsText(file);
        input.value = ''; // Reset
    },

    // --- Lógica de Relatórios ---
    changeReportPeriod(newPeriod) {
        state.period = newPeriod;
        document.querySelectorAll('.report-period-btn').forEach(btn => {
            if(btn.dataset.period === newPeriod) {
                btn.className = "report-period-btn px-4 py-1.5 text-sm font-medium rounded-md bg-brand-50 text-brand-700 shadow-sm";
            } else {
                btn.className = "report-period-btn px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-900";
            }
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
        // Preparar Dados Categorias
        const categories = {};
        tasks.forEach(t => categories[t.category] = (categories[t.category] || 0) + 1);

        // Preparar Dados Diários
        const daily = {};
        tasks.forEach(t => {
            const d = new Date(t.createdAt).toLocaleDateString('pt-BR', { weekday: 'short' });
            daily[d] = (daily[d] || 0) + 1;
        });

        // Config Chart.js
        const chartConfig = {
            responsive: true,
            maintainAspectRatio: false
        };

        // 1. Pie Chart
        const ctxPie = document.getElementById('chart-categories');
        if (state.charts.pie) state.charts.pie.destroy();
        
        state.charts.pie = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: chartConfig
        });

        // 2. Bar Chart
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

        const tasks = this.getFilteredTasksForReport();
        const stats = {
            totalTasks: tasks.length,
            completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0
        };

        const report = await geminiService.generateReport(tasks, state.period, stats);
        
        // Simple Markdown parser for bold text
        const formattedReport = report
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        resultDiv.innerHTML = formattedReport;
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Gerar Novamente';
    }
};

// Iniciar
window.onload = () => app.init();
