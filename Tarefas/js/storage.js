// Gerenciamento de Dados Locais
const STORAGE_KEY = 'taskflow_tasks_v2';

export const storage = {
  // Buscar todas as tarefas
  getTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Salvar lista de tarefas
  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  // Adicionar nova tarefa
  addTask(task) {
    const tasks = this.getTasks();
    tasks.unshift(task); // adiciona no topo
    this.saveTasks(tasks);
    return tasks;
  },

  // Atualizar tarefa existente
  updateTask(updatedTask) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
    }
    return tasks;
  },

  // Excluir tarefa
  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
    return tasks;
  },

  // Processar tarefas recorrentes (corrigido para evitar loop infinito)
  processRecurring() {
    const tasks = this.getTasks();
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    const newTaskList = [];

    tasks.forEach(task => {
      if (task.isRecurring && task.isCompleted && task.completedAt) {
        const completionDate = task.completedAt.split('T')[0];

        if (completionDate < today) {
          // Verifica se já existe uma recorrente igual para hoje
          const alreadyExists = tasks.some(t =>
            t.isRecurring &&
            t.title === task.title &&
            t.dueDate &&
            t.dueDate.split('T')[0] === today
          );

          if (!alreadyExists) {
            hasChanges = true;

            // Arquiva a antiga
            newTaskList.push({ ...task, isRecurring: false });

            // Cria nova tarefa para hoje
            newTaskList.push({
              ...task,
              id: crypto.randomUUID(),
              isCompleted: false,
              completedAt: null,
              createdAt: new Date().toISOString(),
              dueDate: new Date().toISOString(),
              isRecurring: true
            });
          } else {
            // Só arquiva a antiga
            newTaskList.push({ ...task, isRecurring: false });
          }

          return; // evita duplicação
        }
      }

      // Mantém tarefa original
      newTaskList.push(task);
    });

    if (hasChanges) {
      this.saveTasks(newTaskList);
    }

    return newTaskList;
  }
};
