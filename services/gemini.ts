import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = (history: Content[] = []): Chat => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are an expert gardening assistant named GreenThumb. You provide helpful, accurate, and encouraging advice about plants, gardening, soil health, and pest control. Keep answers concise but informative.",
    },
    history: history,
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const analyzePlantImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: "Identify this plant. Provide its common name, scientific name, and a brief guide on how to care for it (water, light, soil). Format the output in Markdown."
          }
        ]
      }
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
};
