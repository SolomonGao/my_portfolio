import { GoogleGenAI } from "@google/genai";
import { HeatData } from '../types';

export const fetchHeatData = async (): Promise<HeatData> => {
  if (!process.env.API_KEY) {
    return {
        summary: "API Key missing. Simulate: The Miami Heat are known for their 'Culture', focusing on hard work and defense.",
        keyPlayers: ["Jimmy Butler (Mock)", "Bam Adebayo (Mock)", "Tyler Herro (Mock)"]
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Provide a brief, exciting summary of the Miami Heat's current status in the NBA (max 2 sentences) and list their top 3 key players. Return as JSON with keys: 'summary' and 'keyPlayers' (array of strings).",
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as HeatData;
  } catch (error) {
    console.error("Failed to fetch Heat data", error);
    return {
      summary: "The Miami Heat continue to be a formidable force in the Eastern Conference, relying on their grit and defensive tenacity.",
      keyPlayers: ["Jimmy Butler", "Bam Adebayo", "Tyler Herro"]
    };
  }
};
