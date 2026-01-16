import type { ApiResponse, Discount } from "@/types/api-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export const useAvailableDiscounts = () => {
  return useQuery({
    queryKey: ["discounts", "available"],
    queryFn: () => api.get<ApiResponse<Discount[]>>("/api/v1/discounts"),
  });
};

export const useMyClaims = () => {
  return useQuery({
    queryKey: ["discounts", "claims"],
    queryFn: () => api.get<ApiResponse<{ discount: Discount }[]>>("/api/v1/discounts/my-claims"),
  });
};

export const useClaimDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      api.post<ApiResponse<any>>("/api/v1/discounts/claim", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};
