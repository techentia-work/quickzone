// @/lib/api/featuredApi.ts
import { CreateFeaturedPayload, FeaturedType, UpdateFeaturedPayload } from "@/lib/types/featured/featured.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const featuredApi = {
  // Public endpoints
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      featured: FeaturedType[];
      pagination: PaginationResponse;
    }>(`/api/featured?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get<FeaturedType>(`/api/featured/${id}`),

  // Admin endpoints
  create: (data: CreateFeaturedPayload) =>
    axiosClient.post<FeaturedType>("/api/featured", data),

  update: (id: string, data: UpdateFeaturedPayload) =>
    axiosClient.put<FeaturedType>(`/api/featured/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/api/featured/${id}`),

  // Analytics / Extra endpoints
  getStats: () => axiosClient.get(`/api/featured/analytics/stats`),

  toggleStatus: (id: string) =>
    axiosClient.patch<FeaturedType>(`/api/featured/${id}/toggle-status`),
};

export default featuredApi;
