import { GoogleGenAI } from "@google/genai";
import { Task, Period, ReportData } from '../types';

const periodMap: Record<Period, string> = {
  'Weekly': 'Semanal',
  'Monthly': 'Mensal',
  'Annual': 'Anual'
};

export const generateAIReport = async (tasks: Task[], period: Period, stats: ReportData): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare context for the model
    const taskSummary = tasks.map(t => 
      `- [${t.isCompleted ? 'x' : ' '}] ${t.title} (${t.priority}, ${t.category}) para ${new Date(t.dueDate).toLocaleDateString('pt-BR')}`
    ).join('\n');

    const prompt = `
      Você é um coach de produtividade especialista. Analise os seguintes dados de tarefas para um Relatório ${periodMap[period]}.
      
      Estatísticas:
      - Taxa de Conclusão: ${stats.completionRate}%
      - Total de Tarefas: ${stats.totalTasks}
      - Concluídas: ${stats.completedTasks}
      - Alta Prioridade Concluídas: ${stats.highPriorityCompleted}
      
      Resumo da Lista de Tarefas:
      ${taskSummary}
      
      Por favor, forneça um relatório conciso, motivador e acionável (máximo de 200 palavras).
      Destaque conquistas, identifique gargalos (como tarefas de alta prioridade perdidas) e sugira 1 melhoria específica para o próximo período.
      Responda em Português do Brasil.
      Formate como Markdown limpo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise neste momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao gerar relatório com IA. Por favor, verifique sua chave de API ou conexão com a internet.";
  }
};