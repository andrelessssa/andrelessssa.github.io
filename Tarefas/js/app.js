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
                this.updateDriveUI(true); // Atualiza UI se já tiver token válido/config
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
        // Passo 1: Configuração
        if (!driveService.getConfig()) {
            const clientId = prompt("Configuração Inicial:\n\nInsira seu Google Client ID:");
            if (!clientId) return;
            const apiKey = prompt("Insira sua Google API Key:");
            if (!apiKey) return;
            driveService.saveConfig(clientId, apiKey);
            
            // Recarrega init com nova config
            try {
                await driveService.init();
            } catch (e) {
                alert("Erro ao inicializar scripts do Google. Tente recarregar a página.");
                return;
            }
        }

        // Passo 2: Autenticação
        try {
            const btnConnect = document.getElementById('btn-drive-connect');
            const originalText = btnConnect.innerHTML;
            btnConnect.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            
            await driveService.connect();
            this.updateDriveUI(true);
            alert("✅ Conectado ao Google Drive com sucesso!");
        } catch (e) {
            console.error(e);
            alert("Erro ao conectar. Verifique se o Client ID está correto e se você autorizou o pop-up.");
        } finally {
             const btnConnect = document.getElementById('btn-drive-connect');
             if(btnConnect) btnConnect.innerHTML = '<i class="fas fa-plug"></i> Conectar Drive';
        }
    },

    async uploadToDrive() {
        if(confirm("Deseja SALVAR suas tarefas locais no Google Drive? (Isso substituirá o backup anterior)")) {
            try {
                document.body.style.cursor = 'wait';
                await driveService.upload(state.tasks);
                alert("✅ Backup salvo com sucesso!");
            } catch (e) {
                console.error(e);
                alert("❌ Erro ao salvar no Drive. Verifique a conexão.");
            } finally {
                document.body.style.cursor = 'default';
            }
        }
    },

    async restoreFromDrive() {
        if(confirm("⚠️ Atenção: Isso substituirá TODAS suas tarefas locais pelo backup da nuvem. Continuar?")) {
            try {
                document.body.style.cursor = 'wait';
                const tasks = await driveService.download();
                if(tasks) {
                    state.tasks = tasks;
                    storage.saveTasks(tasks);
                    // Reprocessa recorrências caso o backup seja antigo
                    state.tasks = storage.processRecurring();
                    this.renderTasks();
                    alert("✅ Dados restaurados com sucesso!");
                } else {
                    alert("⚠️ Nenhum backup encontrado no Drive.");
                }
            } catch (e) {
                console.error(e);
                alert("❌ Erro ao baixar do Drive.");
            } finally {
                document.body.style.cursor = 'default';
            }
        }
    },

    disconnectDrive() {
        driveService.disconnect();
        this.updateDriveUI(false);
        alert("Desconectado do Google Drive.");
    },

    updateDriveUI(isConnected) {
        const btnConnect = document.getElementById('btn-drive-connect');
        const controls = document.getElementById('drive-controls');
        const navMobile = document.getElementById('nav-drive-mobile');
        
        // Estado do botão mobile
        if(navMobile) {
            navMobile.onclick = isConnected ? () => this.uploadToDrive() : () => this.connectDrive();
            const icon = navMobile.querySelector('i');
            const text = navMobile.querySelector('span');
            
            if(isConnected) {
                navMobile.classList.add('text-brand-600');
                if(icon) icon.className = "fas fa-cloud-upload-alt text-xl mb-1";
                if(text) text.innerText = "Salvar";
            } else {
                navMobile.classList.remove('text-brand-600');
                if(icon) icon.className = "fab fa-google-drive text-xl mb-1";
                if(text) text.innerText = "Nuvem";
            }
        }

        // Estado da Sidebar
        if (isConnected) {
            btnConnect.classList.add('hidden');
            controls.classList.remove('hidden');
        } else {
            btnConnect.classList.remove('hidden');
            controls.classList.add('hidden');
        }
    },

    handleMobileDriveAction() {
        // Redireciona para o handler correto baseado no estado
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
                    alert("✅ Importação concluída!");
                } else {
                    alert("❌ Formato de arquivo inválido.");
                }
            } catch (err) {
                alert("❌ Erro ao ler o arquivo JSON.");
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
                    // CORES AZULADAS
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#2563eb']
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
                    backgroundColor: '#3b82f6', // Azul principal
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
        
        // Estado de Carregamento
        btn.disabled = true;
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
        resultDiv.innerHTML = '<p class="text-brand-200 animate-pulse">Consultando o Gemini AI...</p>';

        try {
            const tasks = this.getFilteredTasksForReport();
            const stats = {
                totalTasks: tasks.length,
                completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0
            };

            const report = await geminiService.generateReport(tasks, state.period, stats);
            
            // Se retornar KEY_MISSING, pede ao usuário
            if (report === "KEY_MISSING") {
                const newKey = prompt("Para gerar relatórios com IA, insira sua chave da API do Gemini (Google AI Studio):");
                if (newKey) {
                    geminiService.setKey(newKey);
                    // Tenta novamente recursivamente
                    return this.generateAI(); 
                } else {
                    resultDiv.innerHTML = '<p class="text-red-300">Relatório cancelado: Chave API não fornecida.</p>';
                    return;
                }
            }
            
            // Formata e exibe
            const formattedReport = report
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

            resultDiv.innerHTML = formattedReport;

        } catch (error) {
            console.error(error);
            resultDiv.innerHTML = '<p class="text-red-300">Ocorreu um erro ao gerar o relatório.</p>';
        } finally {
            // Garante que o botão seja reativado SEMPRE (fim do loop infinito)
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Gerar Novamente';
        }
    }
};

// Iniciar
window.onload = () => app.init();