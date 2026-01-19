import type {
  AuthResponse,
  ChangePasswordData,
  ForgotPasswordData,
  LoginCredentials,
  RefreshTokenResponse,
  RegisterData,
  ResetPasswordData,
  UserResponse,
} from "@/types/api-types"; // I'll need to create types next
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthResponse>("/api/v1/auth/login", data),

  register: (data: RegisterData) =>
    api.post<UserResponse>("/api/v1/auth/register", data),

  logout: () =>
    api.post<{ success: true; message: string }>("/api/v1/auth/logout", {}),

  refreshToken: (token: string) =>
    api.post<RefreshTokenResponse>("/api/v1/auth/refresh-token", {
      refreshToken: token,
    }),

  forgotPassword: (data: ForgotPasswordData) =>
    api.post<{ success: true; message: string }>(
      "/api/v1/auth/forgot-password",
      data,
    ),

  resetPassword: (data: ResetPasswordData) =>
    api.post<{ success: true; message: string }>(
      "/api/v1/auth/reset-password",
      data,
    ),

  validateResetToken: (token: string) =>
    api.get<{
      success: true;
      message: string;
      data: { valid: boolean };
      error?: string;
    }>(`/api/v1/auth/reset-password/validate/${token}`),

  changePassword: (data: ChangePasswordData) =>
    api.post<{ success: true; message: string }>(
      "/api/v1/auth/change-password",
      data,
    ),
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
