// @/lib/api/featuredWeekBrand/featuredWeekBrand.api.ts
import axiosClient from "@/lib/api/client/axios";
import {
  FeaturedWeekBrandType,
  CreateFeaturedWeekBrandPayload,
  UpdateFeaturedWeekBrandPayload,
} from "@/lib/types/featuredWeekBrand/featuredWeekBrand.types";
import { PaginationResponse } from "@/lib/types";

export const featuredWeekBrandApi = {
  // GET ALL
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      items: FeaturedWeekBrandType[];
      pagination: PaginationResponse;
    }>(`/api/featured-week-brand?${queryParams ?? ""}`),

  // GET BY ID
  getById: (id: string) =>
    axiosClient.get<FeaturedWeekBrandType>(
      `/api/featured-week-brand/${id}`
    ),

  // CREATE
  create: (data: CreateFeaturedWeekBrandPayload) =>
    axiosClient.post<FeaturedWeekBrandType>(
      "/api/featured-week-brand",
      data
    ),

  // UPDATE
  update: (id: string, data: UpdateFeaturedWeekBrandPayload) =>
    axiosClient.put<FeaturedWeekBrandType>(
      `/api/featured-week-brand/${id}`,
      data
    ),

  // DELETE
  delete: (id: string) =>
    axiosClient.delete(`/api/featured-week-brand/${id}`),

  // TOGGLE ACTIVE / INACTIVE
  toggleStatus: (id: string) =>
    axiosClient.patch<FeaturedWeekBrandType>(
      `/api/featured-week-brand/${id}/toggle-status`
    ),

  // OPTIONAL (future use)
  getStats: () =>
    axiosClient.get(`/api/featured-week-brand/analytics/stats`),
};

export default featuredWeekBrandApi;
