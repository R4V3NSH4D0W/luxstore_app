import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type {
  Address,
  ApiResponse,
  CreateAddressData,
  UpdateAddressData,
  UpdateProfileData,
  User,
  UserResponse,
  Wishlist
} from '../types/api-types';

export const userApi = {
  getProfile: () => api.get<UserResponse>('/api/users/me'),
  updateProfile: (data: UpdateProfileData) => api.patch<UserResponse>('/api/users/me', data), 
  getAddresses: () => api.get<ApiResponse<Address[]>>('/api/users/me/addresses'),
  createAddress: (data: CreateAddressData) => api.post<ApiResponse<Address>>('/api/users/me/addresses', data),
  updateAddress: (id: string, data: UpdateAddressData) => api.patch<ApiResponse<Address>>(`/api/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<ApiResponse<Address>>(`/api/users/me/addresses/${id}`),
  getWishlist: () => api.get<ApiResponse<Wishlist[]>>('/api/users/me/wishlist'),
  toggleWishlist: (productId: string) => api.post<ApiResponse<{ id: string }>>('/api/users/me/wishlist', { productId }),
  getAllUsers: () => api.get<ApiResponse<User[]>>('/api/users/getAll'),
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
