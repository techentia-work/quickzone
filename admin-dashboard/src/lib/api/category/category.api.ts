import axiosClient from "../client/axios";
import { CategoryType, CreateCategoryPayload, CategoryTreeQueryParams, PaginationResponse, UpdateCategoryPayload, } from "@/lib/types";

export const categoryApi = {
  // Public endpoints
  getAll: (queryParams?: string) => axiosClient.get<{ categories: CategoryType[]; pagination: PaginationResponse; }>(`/api/category?${queryParams ?? ""}`),
  getById: (id: string) => axiosClient.get<CategoryType>(`/api/category/${id}`),

  // Tree
  getTree: (treeQueryParams?: string) => axiosClient.get<CategoryType[]>(`/api/category/tree?${treeQueryParams}`),

  // Admin endpoints
  create: (data: CreateCategoryPayload) =>
    axiosClient.post<CategoryType>(`/api/category`, data),
  getAdminCategories: () =>
    axiosClient.get<{ categories: CategoryType[] }>(`/api/category/admin/categories`),
  update: (id: string, data: UpdateCategoryPayload) =>
    axiosClient.put<CategoryType>(`/api/category/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/api/category/${id}?cascade=true`),
  bulkDelete: (ids: string[]) =>
    axiosClient.delete(`/api/category/bulk`, { data: { ids } }),
  restore: (id: string) =>
    axiosClient.patch<CategoryType>(`/api/category/${id}/restore`),
  rebuildTree: (id: string) =>
    axiosClient.post(`/api/category/${id}/rebuild-tree`),
  rebuildTreeAll: () => axiosClient.post(`/api/category/rebuild-tree/all`),
};

export default categoryApi;