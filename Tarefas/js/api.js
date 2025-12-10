import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class AIService {
    async generateReport(tasks, period) {
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
        const pendingTasks = tasks.filter(t => t.status === 'PENDING');

        const prompt = `
            Você é um assistente pessoal e coach de produtividade.
            
            Gere um Relatório de Produtividade ${period === 'Weekly' ? 'Semanal' : 'Mensal'} baseado nos seguintes dados:
            
            - Tarefas Concluídas (${completedTasks.length}): ${JSON.stringify(completedTasks.map(t => t.title))}
            - Tarefas Pendentes (${pendingTasks.length}): ${JSON.stringify(pendingTasks.map(t => t.title))}
            
            Estrutura do Relatório:
            1. **Resumo Executivo**: Uma frase motivadora sobre o desempenho.
            2. **Destaques**: O que foi realizado de importante (focar nas tarefas de alta prioridade se houver).
            3. **Para Melhorar**: Sugestão baseada nas tarefas pendentes.
            4. **Conclusão**: Encerramento profissional em Português do Brasil.
            
            Não use formatação de código markdown (\`\`\`), apenas texto formatado com negrito e listas.
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Erro API:", error);
            throw new Error("Falha ao gerar relatório.");
        }
    }
}