const STORAGE_KEY = 'gestor_tarefas_data_v1';

export class Store {
    constructor() {
        this.tasks = this.load();
    }

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Erro ao carregar dados", e);
            return [];
        }
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
        // Disparar evento customizado para atualizar UI
        window.dispatchEvent(new Event('store-updated'));
    }

    addTask(taskData) {
        const newTask = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            status: 'PENDING',
            ...taskData
        };
        this.tasks.unshift(newTask);
        this.save();
        return newTask;
    }

    updateTask(id, data) {
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...data } : t);
        this.save();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    }

    toggleStatus(id) {
        this.tasks = this.tasks.map(t => {
            if (t.id === id) {
                const isCompleted = t.status === 'COMPLETED';
                return {
                    ...t,
                    status: isCompleted ? 'PENDING' : 'COMPLETED',
                    completedAt: isCompleted ? undefined : Date.now()
                };
            }
            return t;
        });
        this.save();
    }

    getTasks() {
        return this.tasks;
    }

    getTask(id) {
        return this.tasks.find(t => t.id === id);
    }
}