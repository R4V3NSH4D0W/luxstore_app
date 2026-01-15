import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  products?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    currency: string;
    images?: string[];
    brand?: {
      id: string;
      name: string;
    } | null;
  }[];
  _count?: {
    products: number;
  }
}

export interface CampaignListResponse {
  success: boolean;
  campaigns: Campaign[];
}

export const campaignApi = {
  getCampaigns: () => api.get<CampaignListResponse>('/api/v1/campaigns'),
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignApi.getCampaigns,
  });
};
