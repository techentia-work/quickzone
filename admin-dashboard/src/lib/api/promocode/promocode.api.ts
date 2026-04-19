import { PromoType } from "@/lib/types/promocode/promocode.types";
import axiosClient from "../client/axios";
import {
  BulkCreatePromoPayload,
  CreatePromoPayload,
  UpdatePromoPayload,
} from "@/lib/types/promocode/promocode.payload";
import { PaginationResponse } from "@/lib/types";

export const promoApi = {
  // ➕ Create a single promo
  create: (data: CreatePromoPayload) =>
    axiosClient.post<PromoType>(`/api/promocode`, data),

  // 🧩 Bulk create promos
  bulkCreate: (data: BulkCreatePromoPayload) =>
    axiosClient.post<{ created: number; failed: number }>(
      `/api/promocode/bulk`,
      data
    ),

  // 📜 Get all promos (with pagination/filter)
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      promocodes: PromoType[];
      pagination: PaginationResponse;
    }>(`/api/promocode?${queryParams ?? ""}`),

  // 📈 Get promo statistics
  getStats: () =>
    axiosClient.get<{
      statistics: {
        overview: {
          activePromos: number;
          totalPromos: number;
          expiredPromos: number;
          totalUsage: number;
        };
      };
    }>(`/api/promocode/statistics`),

  // 🔍 Get promo by ID
  getById: (id: string) => axiosClient.get<PromoType>(`/api/promocode/${id}`),

  // ✏️ Update promo details
  update: (id: string, data: UpdatePromoPayload) =>
    axiosClient.put<PromoType>(`/api/promocode/${id}`, data),

  // 🟢 Toggle promo active/inactive
  toggleStatus: (id: string) =>
    axiosClient.patch<{ active: boolean }>(
      `/api/promocode/${id}/toggle-status`
    ),

  // 🕓 Get promo usage history
  getUsageHistory: (id: string) =>
    axiosClient.get<{ usageHistory: any[] }>(
      `/api/promocode/${id}/usage-history`
    ),

  // ❌ Delete promo
  delete: (id: string) => axiosClient.delete(`/api/promocode/${id}`),
};

export default promoApi;
