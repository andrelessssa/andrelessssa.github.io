import { GoogleGenAI } from "@google/genai";

const GEMINI_KEY_STORAGE = 'taskflow_gemini_api_key';

export const geminiService = {
    getKey() {
        return localStorage.getItem(GEMINI_KEY_STORAGE);
    },

    setKey(key) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key);
    },

    async generateReport(tasks, period, stats) {
        try {
            // Tenta pegar a chave do localStorage
            const apiKey = this.getKey();

            if (!apiKey) {
                throw new Error("API_KEY_MISSING");
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
              
              Foque em: 1 elogio, 1 ponto de atenção e 1 dica prática. Use Markdown (negrito em palavras chave).
            `;

            // Timeout Wrapper: Evita que a requisição fique presa para sempre
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("TIMEOUT")), 15000); // 15 segundos max
            });

            const apiPromise = ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            const response = await Promise.race([apiPromise, timeoutPromise]);

            return response.text;
        } catch (error) {
            console.error("Gemini Error:", error);
            if (error.message === "API_KEY_MISSING") {
                return "KEY_MISSING"; // Sinal para o App pedir a chave
            }
            if (error.message === "TIMEOUT") {
                return "O tempo limite de conexão excedeu. Verifique sua internet e tente novamente.";
            }
            return `Erro ao conectar com a Inteligência Artificial (${error.message || 'Desconhecido'}).`;
        }
    }
};