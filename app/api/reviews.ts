import type { Review } from '@/types/api-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export const reviewsApi = {
  // Get reviews for a product
  getReviewsByProduct: (productId: string) => 
    api.get<{ success: boolean; reviews: Review[] }>(`/api/reviews/product/${productId}`),

  // Submit a review
  createReview: (data: CreateReviewData) => 
    api.post<{ success: boolean; review: Review }>('/api/reviews', data),

  // Delete own review
  deleteReview: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/api/reviews/${id}`),
};

// --- Hooks ---

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getReviewsByProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
};

export const useDeleteReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};
