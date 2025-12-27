import { ApiResponse, Category } from "@/types/api-types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export interface SearchSuggestions {
  trending: string[];
  categories: Partial<Category>[];
}

export const searchApi = {
  getSuggestions: () =>
    api.get<ApiResponse<SearchSuggestions>>("/api/search/suggestions"),
    
  trackSearch: (query: string, resultsCount?: number) => 
    api.post("/api/search/track", { query, resultsCount }),
};

export const useSearchSuggestions = () => {
  return useQuery({
    queryKey: ["search", "suggestions"],
    queryFn: () => searchApi.getSuggestions(),
  });
};
