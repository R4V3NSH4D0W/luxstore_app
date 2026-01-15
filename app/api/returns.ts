import { api } from '../lib/api-client';

export interface ReturnItem {
  orderItemId: string;
  quantity: number;
  reason: string;
}

export interface ReturnRequestData {
  orderId: string;
  items: ReturnItem[];
  reason: string;
  description?: string;
  images?: string[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  reason: string;
  description?: string;
  refundAmount: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    orderItem: {
      product: {
        name: string;
        images: string[];
      };
    };
  }[];
}

export const returns = {
  createReturnRequest: (data: ReturnRequestData) =>
    api.post<ReturnRequest>('/api/v1/returns', data),

  listMyReturns: () =>
    api.get<ReturnRequest[]>('/api/v1/returns'),
};

export const useReturns = {
  create: () => returns.createReturnRequest,
  list: () => returns.listMyReturns,
};
