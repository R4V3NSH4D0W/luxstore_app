import { api } from "../lib/api-client";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface ChatProduct {
  id: string;
  name: string;
  price: number | string;
  images?: string[];
  brand?: { name: string };
}

export interface ChatResponse {
  text: string;
  products: ChatProduct[];
}

/**
 * Send a message to the AI chat assistant
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  currency: string = "USD",
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>("/api/v1/ai/chat", {
    message,
    history,
    currency,
  });

  return response;
}
