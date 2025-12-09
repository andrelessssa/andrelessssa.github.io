import React from 'react';
import { Task, Priority, Category } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  [Priority.HIGH]: 'text-red-600 bg-red-50 border-red-200',
  [Priority.MEDIUM]: 'text-amber-600 bg-amber-50 border-amber-200',
  [Priority.LOW]: 'text-green-600 bg-green-50 border-green-200',
};

const categoryIcons = {
  [Category.WORK]: 'fa-briefcase',
  [Category.PERSONAL]: 'fa-user',
  [Category.LEARNING]: 'fa-book',
  [Category.HEALTH]: 'fa-heart',
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  return (
    <div className={`group flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all ${task.isCompleted ? 'opacity-60' : ''}`}>
      <button 
        onClick={() => onToggle(task)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-500'
        }`}
      >
        <i className="fas fa-check text-xs"></i>
      </button>
      
      <div className="ml-4 flex-grow min-w-0">
        <div className="flex items-center gap-2">
            <h3 className={`text-sm font-medium text-slate-900 truncate ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
            {task.title}
            </h3>
            {task.isRecurring && (
                <i className="fas fa-sync-alt text-[10px] text-blue-500" title="Tarefa Recorrente (Diária)"></i>
            )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
             <i className={`fas ${categoryIcons[task.category]} text-[10px]`}></i> {task.category}
          </span>
          <span className="text-xs text-slate-400">
             • {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(task)}
          className="ml-2 text-slate-400 hover:text-brand-600 p-2"
          title="Editar"
        >
          <i className="fas fa-pen"></i>
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="ml-1 text-slate-400 hover:text-red-500 p-2"
          title="Excluir"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  );
};