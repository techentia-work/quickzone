import { BannerType } from "@/lib/types/banner/bannr.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const bannerApi = {
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      banners: BannerType[];
      pagination: PaginationResponse;
    }>(`/api/banner?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get<BannerType>(`/api/banner/${id}`),
};
