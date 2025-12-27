


const getBackendUrl = () => {
    // configured in .env
    const url = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (!url) {
        // Fallback or error if missing
        console.warn('EXPO_PUBLIC_BACKEND_URL is not set in .env');
        return "https://ng4mq8bt-3000.inc1.devtunnels.ms"; // Fallback to what we know is working
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
        console.error("API Request Failed:", {
            url,
            status: response.status,
            data
        });
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
