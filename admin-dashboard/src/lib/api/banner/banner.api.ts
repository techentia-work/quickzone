// @/lib/api/bannerApi.ts
import { BannerType, CreateBannerPayload, UpdateBannerPayload } from "@/lib/types/banner/banner.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const bannerApi = {
  getAll: (queryParams?: string) => axiosClient.get<{ banners: BannerType[]; pagination: PaginationResponse; }>(`/api/banner?${queryParams ?? ""}`),
  getById: (id: string) => axiosClient.get<BannerType>(`/api/banner/${id}`),
  create: (data: CreateBannerPayload) => axiosClient.post<BannerType>("/api/banner", data),
  update: (id: string, data: UpdateBannerPayload) => axiosClient.put<BannerType>(`/api/banner/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/api/banner/${id}`),
  toggleStatus: (id: string) => axiosClient.patch<BannerType>(`/api/banner/${id}/toggle-status`),
  getStats: () => axiosClient.get(`/api/banner/analytics/stats`),
};

export default bannerApi;