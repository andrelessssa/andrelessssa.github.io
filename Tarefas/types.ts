export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export enum Category {
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  LEARNING = 'Estudos',
  HEALTH = 'Saúde'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string; // ISO Date string
  dueDate: string; // ISO Date string
  completedAt?: string; // ISO Date string
  priority: Priority;
  category: Category;
  isRecurring?: boolean; // New property for daily recurrence
}

export type Period = 'Weekly' | 'Monthly' | 'Annual';

export interface ReportData {
  period: Period;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  highPriorityCompleted: number;
  categoryBreakdown: { name: string; value: number }[];
  dailyActivity: { name: string; tasks: number }[];
  aiAnalysis?: string;
}