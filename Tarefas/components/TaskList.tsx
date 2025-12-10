import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

// Helper to get local date string YYYY-MM-DD
const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [newTaskCategory, setNewTaskCategory] = useState<Category>(Category.WORK);
  const [newTaskDate, setNewTaskDate] = useState(getToday());
  const [newTaskRecurring, setNewTaskRecurring] = useState(false);

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date(newTaskDate).toISOString(), // Ensure timezone correct if needed, simplified here
      priority: newTaskPriority,
      category: newTaskCategory,
      isRecurring: newTaskRecurring
    };

    onAddTask(newTask);
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskPriority(Priority.MEDIUM);
    setNewTaskCategory(Category.WORK);
    setNewTaskDate(getToday()); // Reset to Today
    setNewTaskRecurring(false);
    setIsAdding(false);
  };

  const handleToggle = (task: Task) => {
    onUpdateTask({
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined
    });
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    onUpdateTask(editingTask);
    setEditingTask(null);
  };

  const filterLabels = {
    all: 'Todas',
    active: 'Pendentes',
    completed: 'Concluídas'
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Minhas Tarefas</h1>
            <p className="text-slate-500 text-sm">Gerencie sua produtividade diária</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Nova Tarefa
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-white p-6 rounded-2xl shadow-lg border border-brand-100 mb-8 animate-fade-in-down">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título da Tarefa</label>
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prioridade</label>
                <select 
                    value={newTaskPriority} 
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                <select 
                    value={newTaskCategory} 
                    onChange={(e) => setNewTaskCategory(e.target.value as Category)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data de Entrega</label>
                <input 
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                />
            </div>
          </div>
          
          <div className="mb-6 flex items-center">
            <input 
              type="checkbox"
              id="isRecurring"
              checked={newTaskRecurring}
              onChange={(e) => setNewTaskRecurring(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="isRecurring" className="ml-2 text-sm text-slate-700 font-medium cursor-pointer select-none flex items-center gap-2">
               <i className="fas fa-sync-alt text-slate-400 text-xs"></i> Repetir diariamente
            </label>
            <span className="ml-2 text-xs text-slate-400">(A tarefa reaparecerá automaticamente amanhã após concluída)</span>
          </div>

          <div className="flex justify-end gap-2">
            <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
            >
                Cancelar
            </button>
            <button 
                type="submit"
                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-md shadow-brand-200"
            >
                Criar Tarefa
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-900">Editar Tarefa</h2>
               <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
               </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título</label>
                <input 
                  type="text" 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prioridade</label>
                    <select 
                        value={editingTask.priority} 
                        onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as Priority})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                    >
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                    <select 
                        value={editingTask.category} 
                        onChange={(e) => setEditingTask({...editingTask, category: e.target.value as Category})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                    >
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div className="mb-4">
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data de Entrega</label>
                 <input 
                    type="date"
                    value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: new Date(e.target.value).toISOString()})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none"
                 />
              </div>

              <div className="mb-6 flex items-center">
                <input 
                  type="checkbox"
                  id="editIsRecurring"
                  checked={editingTask.isRecurring || false}
                  onChange={(e) => setEditingTask({...editingTask, isRecurring: e.target.checked})}
                  className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="editIsRecurring" className="ml-2 text-sm text-slate-700 font-medium cursor-pointer flex items-center gap-2">
                   <i className="fas fa-sync-alt text-slate-400 text-xs"></i> Repetir diariamente
                </label>
              </div>

              <div className="flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => setEditingTask(null)} 
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                 >
                    Cancelar
                 </button>
                 <button 
                    type="submit" 
                    className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-lg shadow-brand-200/50"
                 >
                    Salvar Alterações
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    filter === f 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
                {filterLabels[f]}
            </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
                <div className="text-slate-300 text-6xl mb-4"><i className="fas fa-clipboard-check"></i></div>
                <p className="text-slate-500">Nenhuma tarefa encontrada.</p>
            </div>
        ) : (
            filteredTasks.map(task => (
                <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggle}
                    onDelete={onDeleteTask}
                    onEdit={handleEditClick}
                />
            ))
        )}
      </div>
    </div>
  );
};