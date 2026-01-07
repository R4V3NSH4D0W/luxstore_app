import type {
    Address,
    ApiResponse,
    CreateAddressData,
    UpdateAddressData,
    UpdateProfileData,
    User,
    UserResponse,
    Wishlist
} from '@/types/api-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export const userApi = {
  getProfile: () => api.get<UserResponse>('/api/v1/users/me'),
  updateProfile: (data: UpdateProfileData) => api.patch<UserResponse>('/api/v1/users/me', data), 
  getAddresses: () => api.get<ApiResponse<Address[]>>('/api/v1/users/me/addresses'),
  createAddress: (data: CreateAddressData) => api.post<ApiResponse<Address>>('/api/v1/users/me/addresses', data),
  updateAddress: (id: string, data: UpdateAddressData) => api.patch<ApiResponse<Address>>(`/api/v1/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<ApiResponse<Address>>(`/api/v1/users/me/addresses/${id}`),
  getWishlist: () => api.get<ApiResponse<Wishlist[]>>('/api/v1/users/me/wishlist'),
  toggleWishlist: (productId: string) => api.post<ApiResponse<{ id: string }>>('/api/v1/users/me/wishlist', { productId }),
  getAllUsers: () => api.get<ApiResponse<User[]>>('/api/v1/users/getAll'),
};

export const useProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: userApi.getProfile,
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (response) => {
      // Update the profile in cache
      queryClient.setQueryData(['user', 'me'], response);
    },
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userApi.getAddresses,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateAddressData }) => userApi.updateAddress(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      },
    });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};
