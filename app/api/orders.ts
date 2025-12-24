import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { ApiResponse, CreateOrderInput, Order } from '../types/api-types';

export const orderApi = {
  createOrder: (data: CreateOrderInput) => 
    api.post<ApiResponse<Order>>('/api/checkout', data),
    
  getMyOrders: () => 
    api.get<ApiResponse<Order[]>>('/api/orders'),
    
  getOrderById: (id: string) => 
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),
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
