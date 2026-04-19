import { FeaturedType } from "@/lib/types/featured/featured.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const featuredApi = {
  getAll: (queryParams?: string) => axiosClient.get<{ featured: FeaturedType[]; pagination: PaginationResponse; }>(`/api/featured?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get<FeaturedType>(`/api/featured/${id}`),
};
