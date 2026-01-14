import { ApiResponse, Category, Product } from "@/types/api-types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export interface SearchSuggestions {
  trending: string[];
  categories: Partial<Category>[];
}

export const searchApi = {
  getSuggestions: () =>
    api.get<ApiResponse<SearchSuggestions>>("/api/v1/search/suggestions"),
    
  trackSearch: (query: string, resultsCount?: number) => 
    api.post("/api/v1/search/track", { query, resultsCount }),

  getAutocomplete: (query: string) =>
    api.get<ApiResponse<Product[]>>(
      `/api/v1/search/autocomplete?q=${encodeURIComponent(query)}`
    ),
};

export const useSearchSuggestions = () => {
  return useQuery({
    queryKey: ["search", "suggestions"],
    queryFn: () => searchApi.getSuggestions(),
  });
};

export const useAutocomplete = (query: string) => {
  return useQuery({
    queryKey: ["search", "autocomplete", query],
    queryFn: () => searchApi.getAutocomplete(query),
    enabled: query.length > 2,
    staleTime: 60000, // Cache for 1 min
  });
};
