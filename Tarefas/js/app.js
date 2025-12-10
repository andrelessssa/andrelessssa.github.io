import { Store } from './store.js';
import { AIService } from './api.js';

const store = new Store();
const api = new AIService();
let chartInstance = null;
let currentReportPeriod = 'Weekly';
let currentFilter = 'ALL'; // ALL, PENDING, COMPLETED

// --- Elementos DOM ---
const elements = {
    viewTasks: document.getElementById('view-tasks'),
    viewReports: document.getElementById('view-reports'),
    viewHeaderTasks: document.getElementById('view-header-tasks'),
    viewHeaderReports: document.getElementById('view-header-reports'),
    taskFilters: document.getElementById('task-filters'),
    
    navTasks: document.getElementById('nav-tasks'),
    navReports: document.getElementById('nav-reports'),
    
    btnAddTask: document.getElementById('btn-add-task'),
    formContainer: document.getElementById('task-form-container'),
    taskForm: document.getElementById('task-form'),
    formTitle: document.getElementById('form-title'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    
    btnCancelForm: document.getElementById('btn-cancel-form'),
    btnCancelForm2: document.getElementById('btn-cancel-form-2'),
    
    priorityBtns: document.querySelectorAll('.priority-btn'),
    periodBtns: document.querySelectorAll('.period-btn'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    
    inputPriority: document.getElementById('task-priority'),
    
    btnGenerateReport: document.getElementById('btn-generate-report'),
    reportResult: document.getElementById('report-result'),
    reportContent: document.getElementById('report-content'),
    btnDownload: document.getElementById('btn-download-report'),
    chartCanvas: document.getElementById('tasksChart')
};

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderTaskList();
    setupEventListeners();
});

// --- Event Listeners ---
function setupEventListeners() {
    // Navegação Sidebar
    elements.navTasks.addEventListener('click', () => switchView('tasks'));
    elements.navReports.addEventListener('click', () => switchView('reports'));

    // Filtros
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.getAttribute('data-filter');
            updateFilterVisuals();
            renderTaskList();
        });
    });

    // Formulário
    elements.btnAddTask.addEventListener('click', () => openForm());
    elements.btnCancelForm.addEventListener('click', closeForm);
    elements.btnCancelForm2.addEventListener('click', closeForm);
    
    // Seleção de Prioridade
    elements.priorityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-value');
            elements.inputPriority.value = val;
            updatePriorityVisuals(val);
        });
    });

    // Seleção de Período do Relatório
    elements.periodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentReportPeriod = e.target.getAttribute('data-value');
            elements.periodBtns.forEach(b => {
                b.classList.remove('bg-white', 'text-indigo-700', 'shadow-sm');
                b.classList.add('text-indigo-100', 'hover:bg-white/10');
            });
            e.target.classList.remove('text-indigo-100', 'hover:bg-white/10');
            e.target.classList.add('bg-white', 'text-indigo-700', 'shadow-sm');
        });
    });

    // Submissão do Form
    elements.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;

        if (id) {
            store.updateTask(id, { title, description, priority });
        } else {
            store.addTask({ title, description, priority });
        }
        closeForm();
        // Se adicionamos uma tarefa nova, reseta filtro pra ver ela se necessário, 
        // ou mantem comportamento atual. Vamos manter filtro atual.
        renderTaskList();
    });

    // Gerar Relatório
    elements.btnGenerateReport.addEventListener('click', async () => {
        const btn = elements.btnGenerateReport;
        const originalHTML = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i><span>Analisando...</span>`;
        lucide.createIcons();

        try {
            const report = await api.generateReport(store.getTasks(), currentReportPeriod);
            elements.reportContent.innerHTML = report.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>');
            elements.reportResult.classList.remove('hidden');
            // Scroll to report
            elements.reportResult.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert('Erro ao gerar relatório. Verifique o console.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            lucide.createIcons();
        }
    });

    // Download Relatório
    elements.btnDownload.addEventListener('click', () => {
        const text = elements.reportContent.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${currentReportPeriod.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// --- Funções de UI ---
function switchView(view) {
    if (view === 'tasks') {
        elements.viewTasks.classList.remove('hidden');
        elements.viewHeaderTasks.classList.remove('hidden');
        elements.taskFilters.classList.remove('hidden');
        
        elements.viewReports.classList.add('hidden');
        elements.viewHeaderReports.classList.add('hidden');
        
        // Sidebar active state
        elements.navTasks.className = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-red-50 text-red-600';
        elements.navReports.className = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-900';
    } else {
        elements.viewTasks.classList.add('hidden');
        elements.viewHeaderTasks.classList.add('hidden');
        elements.taskFilters.classList.add('hidden');
        
        elements.viewReports.classList.remove('hidden');
        elements.viewHeaderReports.classList.remove('hidden');
        
        renderChart();
        
        // Sidebar active state
        elements.navReports.className = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-red-50 text-red-600';
        elements.navTasks.className = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-900';
    }
    lucide.createIcons();
}

function updateFilterVisuals() {
    elements.filterBtns.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === currentFilter) {
            btn.className = 'filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-slate-900 text-white transition-all shadow-sm';
        } else {
            btn.className = 'filter-btn px-4 py-1.5 rounded-full text-sm font-medium bg-white text-slate-500 border border-gray-200 hover:border-gray-300 transition-all';
        }
    });
}

function updatePriorityVisuals(priority) {
    elements.priorityBtns.forEach(btn => {
        const btnVal = btn.getAttribute('data-value');
        // Base classes
        let classes = 'priority-btn flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all';
        
        if (btnVal === priority) {
            if (priority === 'HIGH') classes = 'priority-btn flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-red-200 bg-red-50 text-red-700 ring-1 ring-red-500 transition-all shadow-sm';
            else if (priority === 'MEDIUM') classes = 'priority-btn flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-yellow-200 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500 transition-all shadow-sm';
            else classes = 'priority-btn flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-green-200 bg-green-50 text-green-700 ring-1 ring-green-500 transition-all shadow-sm';
        }
        btn.className = classes;
    });
}

function openForm(task = null) {
    elements.formContainer.classList.remove('hidden');
    elements.btnAddTask.classList.add('opacity-0', 'pointer-events-none'); // Hide button smoothly or just disable
    
    if (task) {
        elements.formTitle.innerText = 'Editar Tarefa';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description || '';
        document.getElementById('task-priority').value = task.priority;
        updatePriorityVisuals(task.priority);
    } else {
        elements.formTitle.innerText = 'Nova Tarefa';
        elements.taskForm.reset();
        document.getElementById('task-id').value = '';
        updatePriorityVisuals('MEDIUM');
    }
}

function closeForm() {
    elements.formContainer.classList.add('hidden');
    elements.btnAddTask.classList.remove('opacity-0', 'pointer-events-none');
}

function renderTaskList() {
    const allTasks = store.getTasks();
    
    // Filter logic
    let tasks = allTasks;
    if (currentFilter === 'PENDING') {
        tasks = allTasks.filter(t => t.status === 'PENDING');
    } else if (currentFilter === 'COMPLETED') {
        tasks = allTasks.filter(t => t.status === 'COMPLETED');
    }

    const container = elements.taskList;
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
        if (currentFilter !== 'ALL') {
            elements.emptyState.querySelector('h3').innerText = 'Nenhuma tarefa neste filtro.';
            elements.emptyState.querySelector('p').innerText = 'Tente mudar o filtro ou adicione novas tarefas.';
        } else {
            elements.emptyState.querySelector('h3').innerText = 'Nenhuma tarefa encontrada.';
            elements.emptyState.querySelector('p').innerText = 'Suas tarefas aparecerão aqui. Clique em "Nova Tarefa" para começar.';
        }
    } else {
        elements.emptyState.classList.add('hidden');
        
        // Sorting
        const sorted = [...tasks].sort((a, b) => {
            if (a.status !== b.status) return a.status === 'PENDING' ? -1 : 1;
            const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            if (a.priority !== b.priority) return pMap[b.priority] - pMap[a.priority];
            return b.createdAt - a.createdAt;
        });

        sorted.forEach(task => {
            const el = document.createElement('div');
            const isDone = task.status === 'COMPLETED';
            const pColors = {
                'HIGH': 'bg-red-50 text-red-700 border-red-100',
                'MEDIUM': 'bg-yellow-50 text-yellow-700 border-yellow-100',
                'LOW': 'bg-green-50 text-green-700 border-green-100'
            };
            const pLabel = { 'HIGH': 'Alta', 'MEDIUM': 'Média', 'LOW': 'Baixa' };

            el.className = `group flex items-start sm:items-center justify-between p-5 bg-white rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-red-100 hover:shadow-md transition-all duration-200 ${isDone ? 'opacity-60 bg-gray-50' : ''}`;
            
            el.innerHTML = `
                <div class="flex items-start gap-4 flex-1 w-full">
                    <button class="btn-toggle mt-0.5 transition-colors ${isDone ? 'text-emerald-500' : 'text-gray-300 hover:text-red-500'}">
                        <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" class="w-6 h-6 stroke-[1.5]"></i>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold truncate leading-tight ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}">${task.title}</h3>
                        ${task.description ? `<p class="text-sm mt-1.5 ${isDone ? 'text-gray-300' : 'text-gray-500'} line-clamp-1">${task.description}</p>` : ''}
                        <div class="flex items-center gap-2 mt-2.5">
                            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase tracking-wide ${pColors[task.priority]}">${pLabel[task.priority]}</span>
                            <span class="text-xs text-gray-400 flex items-center gap-1">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                ${new Date(task.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-1 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="btn-edit p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                    <button class="btn-delete p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `;

            // Bind events within the element
            el.querySelector('.btn-toggle').addEventListener('click', () => {
                store.toggleStatus(task.id);
                renderTaskList();
            });
            el.querySelector('.btn-edit').addEventListener('click', () => openForm(task));
            el.querySelector('.btn-delete').addEventListener('click', () => {
                if(confirm('Excluir esta tarefa?')) {
                    store.deleteTask(task.id);
                    renderTaskList();
                }
            });

            container.appendChild(el);
        });
    }
    lucide.createIcons();
}

function renderChart() {
    const ctx = elements.chartCanvas.getContext('2d');
    const tasks = store.getTasks();
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;

    if (chartInstance) {
        chartInstance.destroy();
    }

    if (tasks.length === 0) return;

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Pendentes'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ['#10B981', '#F59E0B'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            }
        }
    });
}