import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type {
  AuthResponse,
  ChangePasswordData,
  ForgotPasswordData,
  LoginCredentials,
  RefreshTokenResponse,
  RegisterData,
  ResetPasswordData,
  UserResponse
} from '../types/api-types'; // I'll need to create types next

export const authApi = {
  login: (data: LoginCredentials) => api.post<AuthResponse>('/api/auth/login', data),
  
  register: (data: RegisterData) => api.post<UserResponse>('/api/auth/register', data),
  
  logout: () => api.post<{ success: true; message: string }>('/api/auth/logout', {}),
  
  refreshToken: (token: string) => api.post<RefreshTokenResponse>('/api/auth/refresh-token', { refreshToken: token }),
  
  forgotPassword: (data: ForgotPasswordData) => api.post<{ success: true; message: string }>('/api/auth/forgot-password', data),
  
  resetPassword: (data: ResetPasswordData) => api.post<{ success: true; message: string }>('/api/auth/reset-password', data),
  
  validateResetToken: (token: string) => api.get<{ success: true; message: string; data: { valid: boolean } }>(`/api/auth/reset-password/validate/${token}`),

  changePassword: (data: ChangePasswordData) => api.post<{ success: true; message: string }>('/api/auth/change-password', data),
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};
