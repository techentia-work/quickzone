import { axiosClient } from "../client/axios";

const appBrandApi = {
  getAll: (query = "") => axiosClient.get(`/api/app-brand?${query}`),
  create: (data: any) => axiosClient.post("/api/app-brand", data),
  update: (id: string, data: any) => axiosClient.patch(`/api/app-brand/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/api/app-brand/${id}`),
  toggleStatus: (id: string) => axiosClient.patch(`/api/app-brand/${id}/toggle-status`),
};

export default appBrandApi;
