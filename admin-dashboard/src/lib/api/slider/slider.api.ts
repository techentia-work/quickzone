// @/lib/api/sliderApi.ts
import { CreateSliderPayload, SliderType, UpdateSliderPayload } from "@/lib/types/slider/slider.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const sliderApi = {
  // Public endpoints
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      sliders: SliderType[];
      pagination: PaginationResponse;
    }>(`/api/slider?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get<SliderType>(`/api/slider/${id}`),

  // Admin endpoints
  create: (data: CreateSliderPayload) =>
    axiosClient.post<SliderType>("/api/slider", data),

  update: (id: string, data: UpdateSliderPayload) =>
    axiosClient.put<SliderType>(`/api/slider/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/api/slider/${id}`),

  // Analytics / Extra endpoints
  getStats: () => axiosClient.get(`/api/slider/analytics/stats`),

  toggleStatus: (id: string) =>
    axiosClient.patch<SliderType>(`/api/slider/${id}/toggle-status`),
};

export default sliderApi;