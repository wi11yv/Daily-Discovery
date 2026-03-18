import { GoogleGenAI, Type } from "@google/genai";
import { HistoricalEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getEventsForDate(month: number, day: number): Promise<HistoricalEvent[]> {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dateStr = `${monthNames[month]} ${day}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `List 5 significant historical events that happened on ${dateStr}. Provide a detailed story for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            date: { type: Type.STRING, description: "e.g. 14 October" },
            year: { type: Type.STRING, description: "e.g. 1066 AD" },
            description: { type: Type.STRING, description: "A short summary (2 sentences)" },
            fullStory: { type: Type.STRING, description: "A detailed 3-paragraph story" },
            imageUrl: { type: Type.STRING, description: "A descriptive keyword for an image search" },
            readTime: { type: Type.STRING, description: "e.g. 5 min read" },
            category: { type: Type.STRING, description: "e.g. Epic Battle, Scientific Discovery" },
            didYouKnow: { type: Type.STRING, description: "A fun trivia fact" }
          },
          required: ["id", "title", "date", "year", "description", "fullStory", "imageUrl", "readTime", "category"]
        }
      }
    }
  });

  const events = JSON.parse(response.text || "[]") as HistoricalEvent[];
  
  // Enhance image URLs with Unsplash or similar if needed, but for now we'll use picsum with keywords
  return events.map(event => ({
    ...event,
    imageUrl: `https://picsum.photos/seed/${event.imageUrl.replace(/\s+/g, '-')}/800/600`
  }));
}
