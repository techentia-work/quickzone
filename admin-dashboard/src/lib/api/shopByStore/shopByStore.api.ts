import axiosClient from "@/lib/api/client/axios";
import {
  ShopByStoreType,
  CreateShopByStorePayload,
  UpdateShopByStorePayload,
} from "@/lib/types/shopByStore/shopByStore.types";
import { PaginationResponse } from "@/lib/types";

export const shopByStoreApi = {
  // ================= GET ALL =================
  getAll: (queryParams?: string) =>
    axiosClient.get<{
       items: [],
    pagination: {}
    }>(`/api/shop-by-store?${queryParams ?? ""}`),

  // ================= GET BY ID =================
  getById: (id: string) =>
    axiosClient.get<ShopByStoreType>(
      `/api/shop-by-store/${id}`
    ),

  // ================= CREATE =================
  create: (data: CreateShopByStorePayload) =>
    axiosClient.post<ShopByStoreType>(
      "/api/shop-by-store",
      data
    ),

  // ================= UPDATE =================
  update: (id: string, data: UpdateShopByStorePayload) =>
    axiosClient.put<ShopByStoreType>(
      `/api/shop-by-store/${id}`,
      data
    ),

  // ================= DELETE =================
  delete: (id: string) =>
    axiosClient.delete(
      `/api/shop-by-store/${id}`
    ),

  // ================= TOGGLE STATUS =================
  toggleStatus: (id: string) =>
    axiosClient.patch<ShopByStoreType>(
      `/api/shop-by-store/${id}/toggle-status`
    ),

  // ================= OPTIONAL (future use) =================
  getStats: () =>
    axiosClient.get(`/api/shop-by-store/analytics/stats`),
};

export default shopByStoreApi;
