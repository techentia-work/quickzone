import axiosClient from "@/lib/api/client/axios";
import {
  BrandOfTheDayType,
  CreateBrandOfTheDayPayload,
  UpdateBrandOfTheDayPayload,
} from "@/lib/types/brandOfTheDay/brandOfTheDay.types";
import { PaginationResponse } from "@/lib/types";

export const brandOfTheDayApi = {
  // ================= GET ALL =================
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      items: BrandOfTheDayType[];
      pagination: PaginationResponse;
    }>(`/api/brand-of-the-day?${queryParams ?? ""}`),

  // ================= GET BY ID =================
  getById: (id: string) =>
    axiosClient.get<BrandOfTheDayType>(
      `/api/brand-of-the-day/${id}`
    ),

  // ================= CREATE =================
  create: (data: CreateBrandOfTheDayPayload) =>
    axiosClient.post<BrandOfTheDayType>(
      "/api/brand-of-the-day",
      data
    ),

  // ================= UPDATE =================
  update: (id: string, data: UpdateBrandOfTheDayPayload) =>
    axiosClient.put<BrandOfTheDayType>(
      `/api/brand-of-the-day/${id}`,
      data
    ),

  // ================= DELETE =================
  delete: (id: string) =>
    axiosClient.delete(
      `/api/brand-of-the-day/${id}`
    ),

  // ================= TOGGLE STATUS =================
  toggleStatus: (id: string) =>
    axiosClient.patch<BrandOfTheDayType>(
      `/api/brand-of-the-day/${id}/toggle-status`
    ),

  // ================= OPTIONAL (future use) =================
  getStats: () =>
    axiosClient.get(
      `/api/brand-of-the-day/analytics/stats`
    ),
};

export default brandOfTheDayApi;
