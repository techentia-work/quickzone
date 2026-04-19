// @/lib/api/brand/brand.api.ts
import axiosClient from "@/lib/api/client/axios";
import { BrandType, CreateBrandPayload, UpdateBrandPayload } from "@/lib/types";
import { PaginationResponse } from "@/lib/types";

export const brandApi = {
    getAll: (queryParams?: string) => axiosClient.get<{ brands: BrandType[]; pagination: PaginationResponse }>(`/api/brand?${queryParams ?? ""}`),
    getById: (id: string) => axiosClient.get<BrandType>(`/api/brand/${id}`),
    create: (data: CreateBrandPayload) => axiosClient.post<BrandType>("/api/brand", data),
    update: (id: string, data: UpdateBrandPayload) => axiosClient.put<BrandType>(`/api/brand/${id}`, data),
    delete: (id: string) => axiosClient.delete(`/api/brand/${id}`),
    toggleStatus: (id: string) => axiosClient.patch<BrandType>(`/api/brand/${id}/toggle-status`),
    getStats: () => axiosClient.get(`/api/brand/analytics/stats`),
}

export default brandApi;