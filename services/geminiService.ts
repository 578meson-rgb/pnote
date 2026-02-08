
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async refineText(text: string): Promise<string> {
    if (!text.trim()) return "";

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
      throw new Error("Failed to refine text. Please check your connection.");
    }
  }
};
