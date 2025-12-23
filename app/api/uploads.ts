import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export const uploadApi = {
  uploadAvatar: (formData: FormData) => api.upload<{ success: true; data: { url: string } }>('/api/uploads/avatar', formData),
  
  uploadPostImages: (postId: string, formData: FormData) => api.upload<{ success: true; data: { urls: string[] } }>(`/api/uploads/post/${postId}/images`, formData),
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadApi.uploadAvatar,
  });
};

export const useUploadPostImages = () => {
  return useMutation({
    mutationFn: (args: { postId: string; formData: FormData }) => 
      uploadApi.uploadPostImages(args.postId, args.formData),
  });
};
