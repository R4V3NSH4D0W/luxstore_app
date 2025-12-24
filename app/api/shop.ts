import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type {
    Category,
    CategoryWithProducts,
    Collection,
    Media,
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

export interface CollectionListResponse {
  collections: Collection[];
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
  getAllCategories: () => api.get<Category[]>('/categories'),
  getCategories: () => api.get<Category[]>('/categories/showcase'), 
  getCategoryShowcase: () => api.get<Category[]>('/categories/showcase'),
  
  getCategoryById: (id: string, page = 1, limit = 20) => 
    api.get<CategoryWithProducts>(`/categories/${id}?page=${page}&limit=${limit}`),

  getFeaturedCategories: () => api.get<Category[]>('/categories/featured'),

  // Collections
  getCollections: (page = 1, limit = 20) => 
    api.get<CollectionListResponse>(`/collections?page=${page}&limit=${limit}`),
    
  getFeaturedCollections: () => 
    api.get<Collection[]>('/collections/featured'),
    
  getCollectionById: (id: string) => 
    api.get<Collection & { products: Product[] }>(`/collections/${id}`),

  searchCollections: (q: string) => 
    api.get<Collection[]>(`/collections/search?q=${q}`),

  getMediaById: (id: string) => 
    api.get<Media>(`/media/${id}`),

  getTags: () => api.get<{ tags: string[] }>('/products/tags/list'),
  getBrands: () => api.get<{ brands: string[] }>('/products/brands/list'),
};

// --- Hooks ---

export const useProducts = (params: ProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => shopApi.getProducts(params),
  });
};

export const useInfiniteProducts = (params: ProductsParams = {}) => {
  const limit = params.limit || 20;
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      shopApi.getProducts({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ProductListResponse) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => shopApi.getProductById(id),
    enabled: !!id,
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: shopApi.getAllCategories,
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

export const useFeaturedCategories = () => {
  return useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: shopApi.getFeaturedCategories,
  });
};

export const useCategory = (id: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['category', id, page, limit],
    queryFn: () => shopApi.getCategoryById(id, page, limit),
    enabled: !!id,
  });
};

export const useFeaturedCollections = () => {
  return useQuery({
    queryKey: ['collections', 'featured'],
    queryFn: shopApi.getFeaturedCollections,
  });
};

export const useCollections = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['collections', 'list', page, limit],
    queryFn: () => shopApi.getCollections(page, limit),
  });
};

export const useCollection = (id: string) => {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => shopApi.getCollectionById(id),
    enabled: !!id,
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await shopApi.getTags();
      const normalizedTags = Array.from(
        new Set(response.tags.map((t) => t.toLowerCase().trim()))
      ).sort();
      return { tags: normalizedTags };
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: shopApi.getBrands,
  });
};

export const useSearchCollections = (q: string) => {
  return useQuery({
    queryKey: ['collections', 'search', q],
    queryFn: () => shopApi.searchCollections(q),
    enabled: !!q,
  });
};

export const useMedia = (id: string) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => shopApi.getMediaById(id),
    enabled: !!id,
  });
};
