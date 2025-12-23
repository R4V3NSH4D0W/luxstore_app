
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://ng4mq8bt-3000.inc1.devtunnels.ms";

export type APIError = {
  success: false;
  error: string;
  message?: string;
};

export type APIResponse<T> = 
  | { success: true; data: T; message?: string }
  | APIError;

import * as SecureStore from 'expo-secure-store';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Get token (using the same key as AuthContext)
  const token = await SecureStore.getItemAsync('userToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized explicitly?
    if (response.status === 401) {
        // potentially handle logout here or throw specific error
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API Request failed');
    }
    
    return data as T;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { method: 'GET', headers }),
    
  post: <T>(endpoint: string, body: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    }),
    
  put: <T>(endpoint: string, body: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify(body) 
    }),

  patch: <T>(endpoint: string, body: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { 
      method: 'PATCH', 
      headers, 
      body: JSON.stringify(body) 
    }),
    
  delete: <T>(endpoint: string, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { method: 'DELETE', headers }),
    
  // For file uploads, content-type handles itself usually with FormData
  upload: <T>(endpoint: string, formData: FormData, headers?: Record<string, string>) => {
    const url = `${BACKEND_URL}${endpoint}`;
     // Don't set Content-Type for FormData, let browser/client handle multipart boundary
    return fetch(url, {
      method: 'POST',
      headers: { ...headers }, 
      body: formData,
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');
      return data as T;
    });
  }
};

export const getImageUrl = (path?: string | null) => {
  if (!path) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
