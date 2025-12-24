import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import type { ApiResponse, Discount } from "../types/api-types";

export const useAvailableDiscounts = () => {
  return useQuery({
    queryKey: ["discounts", "available"],
    queryFn: () => api.get<ApiResponse<Discount[]>>("/api/discounts"),
  });
};

export const useMyClaims = () => {
  return useQuery({
    queryKey: ["discounts", "claims"],
    queryFn: () => api.get<ApiResponse<{ discount: Discount }[]>>("/api/discounts/my-claims"),
  });
};

export const useClaimDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discountId: string) =>
      api.post<ApiResponse<any>>("/api/discounts/claim", { discountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};
