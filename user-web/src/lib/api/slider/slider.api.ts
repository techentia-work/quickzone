
import { SliderType } from "@/lib/types/slider/slider.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const sliderApi = {
  getAll: (queryParams?: string) =>
    axiosClient.get<{
      sliders: SliderType[];
      pagination: PaginationResponse;
    }>(`/api/slider?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get<SliderType>(`/api/slider/${id}`),
};