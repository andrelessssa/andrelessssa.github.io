import { GoogleGenAI } from "@google/genai";

export const geminiService = {
    async generateReport(tasks, period, stats) {
        try {
            // Tenta pegar a chave do ambiente (injetada via GitHub Actions ou input manual)
            // Como é um app estático client-side, num cenário real o usuário colocaria a chave
            // Mas aqui assumimos que process.env.API_KEY pode estar disponível se configurado no build, 
            // ou falharemos graciosamente.
            const apiKey = process.env.API_KEY; 

            if (!apiKey) {
                return "⚠️ **Configuração Necessária:** API Key não detectada. Por favor, configure sua chave do Google AI Studio.";
            }

            const ai = new GoogleGenAI({ apiKey });
            
            const taskSummary = tasks.slice(0, 30).map(t => 
                `- [${t.isCompleted ? 'x' : ' '}] ${t.title} (${t.priority}, ${t.category})`
            ).join('\n');

            const prompt = `
              Você é um coach de produtividade. Gere um relatório curto (${period}) em PT-BR.
              Dados: ${stats.completionRate}% concluído de ${stats.totalTasks} tarefas.
              Lista parcial:
              ${taskSummary}
              
              Foque em: 1 elogio, 1 ponto de atenção e 1 dica prática. Use Markdown.
            `;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Erro ao conectar com a Inteligência Artificial. Verifique sua conexão ou chave API.";
        }
    }
};
