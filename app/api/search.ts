import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { ApiResponse, Category } from "../types/api-types";

export interface SearchSuggestions {
  trending: string[];
  categories: Partial<Category>[];
}

export const searchApi = {
  getSuggestions: () =>
    api.get<ApiResponse<SearchSuggestions>>("/api/search/suggestions"),
};

export const useSearchSuggestions = () => {
  return useQuery({
    queryKey: ["search", "suggestions"],
    queryFn: () => searchApi.getSuggestions(),
  });
};
