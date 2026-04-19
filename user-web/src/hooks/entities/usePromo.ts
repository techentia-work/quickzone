"use client";

import promoApi from "@/lib/api/promocode/promocode.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePromo(userId: string) {
  const queryClient = useQueryClient();

  // 🎟️ Apply promo
  const applyPromo = useMutation({
    mutationFn: (payload: { code: string }) => promoApi.applyPromo(payload),
    onSuccess: () => {
      // Refresh cart to show applied promo
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // 🧾 Validate promo
  const validatePromo = useMutation({
    mutationFn: (payload: { code: string }) => promoApi.validatePromo(payload),
  });

  // ❌ Remove promo
  const removePromo = useMutation({
    mutationFn: () => promoApi.removePromo(),
    onSuccess: () => {
      // Refresh cart to remove discount
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    applyPromo: applyPromo.mutateAsync,
    validatePromo: validatePromo.mutateAsync,
    removePromo: removePromo.mutateAsync,

    isApplying: applyPromo.isPending,
    isValidating: validatePromo.isPending,
    isRemoving: removePromo.isPending,
  };
}
