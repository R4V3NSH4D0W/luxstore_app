import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "recent_searches";
const MAX_HISTORY = 10;

export const useRecentSearches = () => {
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ["recentSearches"],
    queryFn: async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        return json ? (JSON.parse(json) as string[]) : [];
      } catch {
        return [];
      }
    },
    staleTime: Infinity, // Rely on cache unless mutated
  });

  const addSearch = useMutation({
    mutationFn: async (term: string) => {
      if (!term.trim()) return;
      const normalized = term.trim();
      const newHistory = [
        normalized,
        ...history.filter((t) => t.toLowerCase() !== normalized.toLowerCase()),
      ].slice(0, MAX_HISTORY);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["recentSearches"], newHistory);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["recentSearches"], []);
    },
  });
  
  const removeSearch = useMutation({
      mutationFn: async (term: string) => {
          const newHistory = history.filter(t => t !== term);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
          return newHistory;
      },
      onSuccess: (newHistory) => {
          queryClient.setQueryData(["recentSearches"], newHistory);
      }
  })

  return {
    history,
    addSearch: addSearch.mutate,
    clearHistory: clearHistory.mutate,
    removeSearch: removeSearch.mutate
  };
};
