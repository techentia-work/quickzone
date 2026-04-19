import axiosClient from "../client/axios";

export const promoApi = {
  // 🔹 Apply a promo code
  applyPromo: (payload: { code: string }) =>
    axiosClient.post<{ discount: number; message: string }>(
      "/api/promocode/apply",
      payload
    ),

  // 🔹 Remove an applied promo
  removePromo: () => axiosClient.post<{ message: string }>("/api/promocode/remove"),

  // 🔹 Validate promo without applying (for preview or client-side checks)
  validatePromo: (payload: { code: string }) =>
    axiosClient.post<{ isValid: boolean; discount?: number; message?: string }>(
      "/api/promocode/validate",
      payload
    ),
};

export default promoApi;
