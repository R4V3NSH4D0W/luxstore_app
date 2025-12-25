import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { ApiResponse, Product } from '../types/api-types';

export const recommendationApi = {
  getPeopleAlsoBought: (productId: string, limit = 5) =>
    api.get<ApiResponse<Product[]>>(`/api/recommendations/also-bought/${productId}?limit=${limit}`),

  getRecommendedForYou: (limit = 6) =>
    api.get<ApiResponse<Product[]>>(`/api/recommendations/personalized?limit=${limit}`),
};

export const useAlsoBought = (productId: string, limit = 5) => {
  return useQuery({
    queryKey: ['recommendations', 'also-bought', productId],
    queryFn: () => recommendationApi.getPeopleAlsoBought(productId, limit),
    enabled: !!productId,
  });
};

export const useRecommendedForYou = (limit = 6) => {
  return useQuery({
    queryKey: ['recommendations', 'personalized'],
    queryFn: () => recommendationApi.getRecommendedForYou(limit),
  });
};
