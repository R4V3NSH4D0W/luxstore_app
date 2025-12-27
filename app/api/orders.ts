import type { ApiResponse, CreateOrderInput, Order } from '@/types/api-types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export const orderApi = {
  createOrder: (data: CreateOrderInput) => 
    api.post<ApiResponse<Order>>('/api/checkout', data),
    
  getMyOrders: () => 
    api.get<ApiResponse<Order[]>>('/api/orders'),
    
  getOrderById: (id: string) => 
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    api.post<ApiResponse<Order>>(`/api/orders/${id}/cancel`, { reason }),
};

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: orderApi.createOrder,
    });
};

export const useMyOrders = () => {
    return useQuery({
        queryKey: ['orders', 'my-orders'],
        queryFn: orderApi.getMyOrders,
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: () => orderApi.getOrderById(id),
        enabled: !!id,
    });
};
