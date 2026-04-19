import axiosClient from "../client/axios";
import { CategoryType, PaginationResponse } from "@/lib/types";

export const categoryApi = {
    // Public endpoints
    getAll: (queryParams?: string) => axiosClient.get<{ categories: CategoryType[]; pagination: PaginationResponse }>(`/api/category?${queryParams ?? ""}`),
    getById: (id: string) => axiosClient.get<CategoryType>(`/api/category/${id}`),

    // Tree
    getTree: (treeQueryParams?: string) => axiosClient.get<CategoryType[]>(`/api/category/tree?${treeQueryParams}`),
    getDisplayCategories: (masterId?: string) => axiosClient.get<{ categories: CategoryType[]; pagination: PaginationResponse }>(`/api/category/display?masterId=${masterId}`),
}

export default categoryApi;