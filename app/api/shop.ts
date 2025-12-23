import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type {
    Category,
    Collection,
    Product
} from '../types/api-types';

export interface ProductsParams {
  page?: number;
  limit?: number;
  name?: string;
  featured?: boolean;
  tags?: string;
  brand?: string;
  q?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const shopApi = {
  // Products
  getProducts: (params: ProductsParams = {}) => {
    // Convert params to query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.name) queryParams.append('name', params.name);
    if (params.q) queryParams.append('q', params.q); // Fallback search
    if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params.tags) queryParams.append('tags', params.tags);
    if (params.brand) queryParams.append('brand', params.brand);
    
    return api.get<ProductListResponse>(`/products?${queryParams.toString()}`);
  },

  getProductById: (id: string) => api.get<Product>(`/products/${id}`),

  // Categories
  getCategories: () => api.get<Category[]>('/categories/showcase'), // Using showcase as per user snippet
  getCategoryShowcase: () => api.get<Category[]>('/categories/showcase'),
  
  getCategoryById: (id: string, page = 1, limit = 20) => 
    api.get<{ category: Category, products: Product[] }>(`/categories/${id}?page=${page}&limit=${limit}`),

  // Collections
  getCollections: (page = 1, limit = 20) => 
    api.get<Collection[]>(`/collections?page=${page}&limit=${limit}`),
    
  getFeaturedCollections: () => 
    api.get<Collection[]>('/collections/featured'),
    
  getCollectionById: (id: string) => 
    api.get<Collection & { products: Product[] }>(`/collections/${id}`),
};

// --- Hooks ---

export const useProducts = (params: ProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => shopApi.getProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => shopApi.getProductById(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: shopApi.getCategories,
  });
};

export const useCategoryShowcase = () => {
  return useQuery({
    queryKey: ['categories', 'showcase'],
    queryFn: shopApi.getCategoryShowcase,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => shopApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useFeaturedCollections = () => {
  return useQuery({
    queryKey: ['collections', 'featured'],
    queryFn: shopApi.getFeaturedCollections,
  });
};

export const useCollection = (id: string) => {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => shopApi.getCollectionById(id),
    enabled: !!id,
  });
};
