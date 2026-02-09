import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatProduct } from "../api/ai";
import { api } from "../lib/api-client";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  products?: ChatProduct[];
  timestamp: number;
}

export const useChatHistory = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      try {
        const response = await api.get("/ai/history");
        return response as ChatMessage[];
      } catch (error) {
        console.warn("Failed to fetch chat history:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMessage = (message: ChatMessage) => {
    queryClient.setQueryData<ChatMessage[]>(["chatHistory"], (old = []) => {
      // Avoid duplicates if possible (though simple push is fine for optimistic)
      return [...old, message];
    });
  };

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/ai/history");
    },
    onSuccess: () => {
      queryClient.setQueryData(["chatHistory"], []);
    },
  });

  return {
    messages,
    isLoading,
    addMessage,
    clearHistory: clearHistoryMutation.mutate,
  };
};
