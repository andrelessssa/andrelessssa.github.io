import { Task, Priority, Category } from '../types';

const STORAGE_KEY = 'taskflow_tasks_v1';
const BACKUP_DATE_KEY = 'taskflow_last_backup_date';

export const getTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Return empty array instead of dummy data
    return [];
  }
  return JSON.parse(stored);
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Task): Task[] => {
  const tasks = getTasks();
  const newTasks = [task, ...tasks];
  saveTasks(newTasks);
  return newTasks;
};

export const updateTask = (updatedTask: Task): Task[] => {
  const tasks = getTasks();
  const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  saveTasks(newTasks);
  return newTasks;
};

export const deleteTask = (id: string): Task[] => {
  const tasks = getTasks();
  const newTasks = tasks.filter(t => t.id !== id);
  saveTasks(newTasks);
  return newTasks;
};

// New function to handle bulk import from JSON file
export const importTasksData = (jsonContent: string): Task[] | null => {
  try {
    const parsed = JSON.parse(jsonContent);
    if (Array.isArray(parsed)) {
      // Basic validation check
      if (parsed.length > 0 && (!parsed[0].id || !parsed[0].title)) {
        console.error("Invalid format");
        return null;
      }
      saveTasks(parsed);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse JSON", e);
  }
  return null;
};

// Backup Management
export const getLastBackupDate = (): string | null => {
  return localStorage.getItem(BACKUP_DATE_KEY);
};

export const setLastBackupDate = (date: string) => {
  localStorage.setItem(BACKUP_DATE_KEY, date);
};

// Logic to reset daily recurring tasks
export const processRecurringTasks = (): Task[] => {
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];
  let hasChanges = false;
  
  const newTaskList = tasks.reduce((acc, task) => {
    // Check if task is Recurring AND Completed AND has a completion date
    if (task.isRecurring && task.isCompleted && task.completedAt) {
      const completionDate = task.completedAt.split('T')[0];
      
      // If it was completed before today (yesterday or older)
      if (completionDate < today) {
        hasChanges = true;
        
        // 1. The old task becomes "History":
        // We turn off recurrence on the old one so it doesn't trigger this logic again.
        // It stays in the list as a record for reports.
        const historyTask = { ...task, isRecurring: false };
        acc.push(historyTask);

        // 2. Create the NEW task for TODAY:
        const newTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            isCompleted: false, // Reset to pending
            completedAt: undefined,
            createdAt: new Date().toISOString(), // Created now
            dueDate: new Date().toISOString(), // Due today
            isRecurring: true // The new one continues the chain
        };
        acc.push(newTask);
        return acc;
      }
    }
    
    // If no changes needed for this task, just keep it
    acc.push(task);
    return acc;
  }, [] as Task[]);

  if (hasChanges) {
    saveTasks(newTaskList);
    return newTaskList;
  }
  return tasks;
};