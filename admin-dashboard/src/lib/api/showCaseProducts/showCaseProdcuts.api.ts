import {
  CreateShowcaseProductPayload,
  ShowcaseProductType,
  UpdateShowcaseProductPayload,
} from "@/lib/types/showCaseProduct/showCaseProduct.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const showCaseProductApi = {
  getAll: (queryParams?: string) =>
    axiosClient.get<
      { showcases: ShowcaseProductType[]; pagination: PaginationResponse }
    >(`/api/showcase-products?${queryParams ?? ""}`),
  getById: (id: string) =>
    axiosClient.get<ShowcaseProductType>(`/api/showcase-products/${id}`),
  create: (data: CreateShowcaseProductPayload) =>
    axiosClient.post< { data: ShowcaseProductType; success: boolean; message: string }>(`/api/showcase-products`, data),
  update: (id: string, data: UpdateShowcaseProductPayload) =>
    axiosClient.put<ShowcaseProductType>(`/api/showcase-products/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/api/showcase-products/${id}`),
  toggleStatus: (id: string) =>
    axiosClient.patch<ShowcaseProductType>(
      `/api/showcase-products/${id}/toggle-status`
    ),
};

export default showCaseProductApi;
