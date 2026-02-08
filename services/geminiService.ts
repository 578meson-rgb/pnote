
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string | null => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
        || (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.API_KEY)
        || null;
  } catch (e) {
    return null;
  }
};

export const geminiService = {
  async refineText(text: string): Promise<string> {
    if (!text.trim()) return "";

    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("Gemini API Key is missing. AI features will not work.");
      throw new Error("AI service is currently unavailable. Please check the API key configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: "Refine the following text by correcting grammar, tense, and sentence structure while preserving the original meaning and tone. Do not add new content. Improve clarity and readability. Return refined text only (no explanations or meta-talk).",
          temperature: 0.3,
        }
      });

      return response.text || text;
    } catch (error) {
      console.error("Gemini refinement failed:", error);
      throw new Error("Failed to refine text. Please check your connection and API key.");
    }
  }
};
