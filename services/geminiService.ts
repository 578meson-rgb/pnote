
import { GoogleGenAI } from "@google/genai";

// Initialization with an error check
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set API_KEY in your environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async refineText(text: string): Promise<string> {
    if (!text.trim()) return "";

    const ai = getAI();
    if (!ai) {
      throw new Error("AI service is currently unavailable. Please check the API key configuration.");
    }

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
