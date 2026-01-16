import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

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



// In-memory currency state for the API client to avoid async storage calls on every request
let currentCurrency = 'USD';

export const setApiClientCurrency = (code: string) => {
  currentCurrency = code;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  // Get token (using the same key as AuthContext)
  const token = await SecureStore.getItemAsync('userToken');

  // Define public endpoints that don't require authentication
  const publicEndpoints = [
    '/api/v1/auth',          // Auth routes (login, register, reset)
    '/api/v1/settings',      // Store settings
    '/api/v1/search',        // Product search
    '/api/v1/recommendations/also-bought',
    '/api/v1/products',      // Root-mounted shop routes -> v1
    '/api/v1/categories',
    '/api/v1/collections',
    '/api/v1/media',
    '/client/campaigns', // This one might be weird, check backend
    '/api/v1/currency',      // Currency config
    '/api/v1/settings',
    // Keep legacy for a moment just in case missed something during transition (optional, but cleaner to just switch)
    '/api/auth',
    '/products',
    '/categories',
    '/collections',
    '/media',
    '/api/currency'
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
    'x-currency': currentCurrency,
    'X-Tunnel-Skip-Anti-Phishing-Page': '1',
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
    let parseError = false;
    try {
      data = await response.json();
    } catch {
      parseError = true;
      data = { error: 'Invalid JSON response from server' };
    }

    // Capture parse errors for successful requests (e.g. hitting Next.js HTML instead of API)
    if (response.ok && parseError) {
      throw new Error(`Invalid JSON response from server at ${url}. Possible wrong port or server?`);
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
      // If we can't verify the error type precisely, we assume any status-less error 
      // during fetch is a network/connection issue.

      // Avoid redirecting if we are already on the error screen (basic check)
      // Note: This is an imperative navigation.
      router.replace('/server-error' as any);
    }
    throw error;
  }
}


