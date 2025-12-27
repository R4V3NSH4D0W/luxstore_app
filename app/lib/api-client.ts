


const getBackendUrl = () => {
    // configured in .env
    const url = process.env.EXPO_PUBLIC_BACKEND_URL;
    
    console.log('[API Client] Resolved Backend URL:', url || "http://localhost:3000 (Fallback)");

    // Fallback if env is missing
    if (!url) {
        return "http://192.168.254.34:3000"; 
    }
    return url;
};

const BACKEND_URL = getBackendUrl();


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

  // Define public endpoints that don't require authentication
  const publicEndpoints = [
    '/api/auth',          // Auth routes (login, register, reset)
    '/api/settings',      // Store settings
    '/api/search',        // Product search
    '/api/recommendations/also-bought',
    '/products',          // Root-mounted shop routes
    '/categories',
    '/collections',
    '/media',
    '/client/campaigns',
    '/settings'           // Just in case some logic uses root settings
  ];

  const isPublic = publicEndpoints.some(p => endpoint.startsWith(p));

  // If not authenticated and hitting a protected route, stop here
  if (!token && !isPublic) {
    console.warn(`[API Client] Blocking request to ${endpoint} - Authentication required.`);
    const error: any = new Error('Authentication required');
    error.status = 401;
    error.isAuthError = true;
    throw error;
  }

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  // Only add Content-Type: application/json if there's a body or if it's a method that typically has a body
  if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH' || (options.method === 'DELETE' && options.body)) && !headers['Content-Type']) {
     headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized explicitly
    if (response && response.status === 401) {
        // Token expired or invalid
        await SecureStore.deleteItemAsync('userToken');
    }

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response from server' };
    }

    if (!response.ok) {
        // Suppress logging for 404s as they are often handled gracefully
        if (response.status !== 404) {
            console.error("API Request Failed:", {
                url,
                status: response.status,
                data
            });
        }
        const error: any = new Error(data.message || data.error || `API Request failed: ${response.status}`);
        error.status = response.status;
        error.response = { data }; // Match the structure expected by some components
        throw error;
    }
    
    return data as T;
  } catch (error: any) {
    if (!error.status) {
      console.error(`Network Error at ${endpoint}:`, error);
    }
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
    
  delete: <T>(endpoint: string, body?: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, { 
      method: 'DELETE', 
      headers,
      body: body ? JSON.stringify(body) : undefined
    }),
    
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

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://via.placeholder.com/400";
  if (path.startsWith("http") || path.startsWith("data:")) return path; // Already absolute or data URI
  // Remove leading slash if present to avoid double slashes with BACKEND_URL logic if needed, 
  // but typically BACKEND_URL might not have trailing slash. 
  // Let's safe join.
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // If BACKEND_URL already has a slash at the end, remove it from path
  // simpler:
  return `${BACKEND_URL}${cleanPath}`;
};
