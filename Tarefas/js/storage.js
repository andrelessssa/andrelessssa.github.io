// Gerenciamento de Dados Locais

const STORAGE_KEY = 'taskflow_tasks_v2'; // v2 para garantir limpeza se houver conflito antigo

export const storage = {
    getTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    addTask(task) {
        const tasks = this.getTasks();
        tasks.unshift(task); // Adiciona no topo
        this.saveTasks(tasks);
        return tasks;
    },

    updateTask(updatedTask) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            tasks[index] = updatedTask;
            this.saveTasks(tasks);
        }
        return tasks;
    },

    deleteTask(id) {
        const tasks = this.getTasks().filter(t => t.id !== id);
        this.saveTasks(tasks);
        return tasks;
    },

    // Lógica inteligente de recorrência
    processRecurring() {
        const tasks = this.getTasks();
        const today = new Date().toISOString().split('T')[0];
        let hasChanges = false;
        
        const newTaskList = [];
        
        tasks.forEach(task => {
            // Se for recorrente, completada e de data anterior a hoje
            if (task.isRecurring && task.isCompleted && task.completedAt) {
                const completionDate = task.completedAt.split('T')[0];
                
                if (completionDate < today) {
                    hasChanges = true;
                    
                    // 1. Arquiva a antiga (remove flag de recorrência para não duplicar de novo)
                    newTaskList.push({ ...task, isRecurring: false });

                    // 2. Cria a nova tarefa para hoje
                    newTaskList.push({
                        ...task,
                        id: crypto.randomUUID(),
                        isCompleted: false,
                        completedAt: null,
                        createdAt: new Date().toISOString(),
                        dueDate: new Date().toISOString(), // Hoje
                        isRecurring: true
                    });
                    return;
                }
            }
            newTaskList.push(task);
        });

        if (hasChanges) {
            this.saveTasks(newTaskList);
        }
        return newTaskList;
    }
};
