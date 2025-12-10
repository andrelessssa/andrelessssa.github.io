import React, { useState, useMemo } from 'react';
import { Task, Period, ReportData, Priority } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generateAIReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ReportsProps {
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const periodLabels: Record<Period, string> = {
    'Weekly': 'Semanal',
    'Monthly': 'Mensal',
    'Annual': 'Anual'
};

export const Reports: React.FC<ReportsProps> = ({ tasks }) => {
  const [period, setPeriod] = useState<Period>('Weekly');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter tasks based on period
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const start = new Date();
    
    if (period === 'Weekly') start.setDate(now.getDate() - 7);
    if (period === 'Monthly') start.setMonth(now.getMonth() - 1);
    if (period === 'Annual') start.setFullYear(now.getFullYear() - 1);

    return tasks.filter(t => new Date(t.createdAt) >= start);
  }, [tasks, period]);

  // Calculate statistics
  const stats: ReportData = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.isCompleted).length;
    const highPriorityCompleted = filteredTasks.filter(t => t.isCompleted && t.priority === Priority.HIGH).length;
    
    const categoryCounts: Record<string, number> = {};
    filteredTasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    // Daily activity for the bar chart
    const activityMap: Record<string, number> = {};
    filteredTasks.forEach(t => {
      // Use pt-BR locale for day names
      const date = new Date(t.createdAt).toLocaleDateString('pt-BR', { weekday: 'short' });
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    return {
      period,
      totalTasks: total,
      completedTasks: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      highPriorityCompleted,
      categoryBreakdown: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      dailyActivity: Object.entries(activityMap).map(([name, tasks]) => ({ name, tasks })),
    };
  }, [filteredTasks, period]);

  const handleGenerateAI = async () => {
    setLoading(true);
    const report = await generateAIReport(filteredTasks, period, stats);
    setAiReport(report);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Análises</h1>
            <p className="text-slate-500 text-sm">Visualize seu desempenho</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
            {(['Weekly', 'Monthly', 'Annual'] as Period[]).map((p) => (
                <button
                    key={p}
                    onClick={() => { setPeriod(p); setAiReport(null); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        period === p 
                        ? 'bg-brand-50 text-brand-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    {periodLabels[p]}
                </button>
            ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total de Tarefas</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Concluídas</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-brand-600 mt-2">{stats.completionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Alta Prioridade</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.highPriorityCompleted}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tarefas por Categoria</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Atividade Diária</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyActivity}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* AI Report Section */}
      <div className="bg-gradient-to-br from-brand-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <i className="fas fa-robot text-brand-200"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Relatório de Produtividade IA</h2>
                        <p className="text-brand-200 text-sm">Powered by Gemini 2.5</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleGenerateAI}
                    disabled={loading}
                    className="px-6 py-2 bg-white text-brand-900 rounded-lg font-semibold hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Analisando...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-magic"></i> Gerar Relatório
                        </>
                    )}
                </button>
            </div>

            {aiReport ? (
                <div className="prose prose-invert prose-sm max-w-none bg-white/10 p-6 rounded-xl border border-white/10">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
            ) : (
                <div className="text-brand-100 text-center py-8 border-2 border-dashed border-white/20 rounded-xl">
                    <p>Clique em "Gerar Relatório" para receber insights personalizados para este período {periodLabels[period].toLowerCase()}.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};