import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import type { ApiResponse, Product } from '../types/api-types';

const RECENTLY_VIEWED_KEY = '@recently_viewed_products';
const MAX_RECENT_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setProductIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recently viewed products', e);
    }
  };

  const addProductToRecent = async (productId: string) => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      let currentIds: string[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists to move to top
      currentIds = currentIds.filter((id) => id !== productId);
      
      // Add to beginning
      const newIds = [productId, ...currentIds].slice(0, MAX_RECENT_ITEMS);
      
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newIds));
      setProductIds(newIds);
    } catch (e) {
      console.error('Failed to save recently viewed product', e);
    }
  };

  // Fetch full details for the stored IDs
  const { data: response, isLoading } = useQuery({
    queryKey: ['products', 'recently-viewed', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return { success: true, data: [] };
      
      // We'll fetch them individually or use a bulk endpoint if available
      // For now, let's assume we can fetch by IDs
      const products = await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
            return res.success ? res.data : null;
          } catch {
            return null;
          }
        })
      );

      return {
        success: true,
        data: products.filter((p): p is Product => !!p),
      };
    },
    enabled: productIds.length > 0,
  });

  return {
    products: response?.data || [],
    isLoading,
    addProductToRecent,
  };
};
