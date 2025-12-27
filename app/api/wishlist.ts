import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { ApiResponse, Wishlist } from '@/types/api-types';

export const wishlistApi = {
  getWishlist: () => 
    api.get<ApiResponse<Wishlist[]>>('/api/users/me/wishlist'),
    
  toggleWishlist: (productId: string) => 
    api.post<ApiResponse<{ added: boolean }>>('/api/users/me/wishlist', { productId }),
};

import { useAuth } from '../context/auth-context';

export const useWishlist = () => {
    const { userToken, isLoading } = useAuth();
    return useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const res = await wishlistApi.getWishlist();
            return res.data;
        },
        enabled: !isLoading && !!userToken,
    });
};

export const useToggleWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: wishlistApi.toggleWishlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};
