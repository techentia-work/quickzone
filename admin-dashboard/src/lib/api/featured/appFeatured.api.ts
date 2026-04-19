import axiosClient from "../client/axios";

export const appFeaturedApi = {
  getAll: (queryParams?: string) =>
    axiosClient.get(`/api/app-featured?${queryParams ?? ""}`),

  getById: (id: string) => axiosClient.get(`/api/app-featured/${id}`),

  create: (data: any) =>
    axiosClient.post("/api/app-featured", data),

  update: (id: string, data: any) =>
    axiosClient.put(`/api/app-featured/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/api/app-featured/${id}`),

  toggleStatus: (id: string) =>
    axiosClient.patch(`/api/app-featured/${id}/toggle-status`),
};

export default appFeaturedApi;
