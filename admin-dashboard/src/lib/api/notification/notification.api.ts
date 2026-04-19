import axiosClient from "../client/axios";
import { NotificationType, PaginationResponse } from "@/lib/types";

export const notificationsApi = {
  // =========================
  // USER NOTIFICATIONS
  // =========================
  getAll: (role: string, queryParams?: string) =>
    axiosClient.get<{
      notifications: NotificationType[];
      unreadCount: number;
      pagination: PaginationResponse;
    }>(
      `/api/notifications?role=${role}${queryParams ? `&${queryParams}` : ""}`
    ),

  getById: (id: string) =>
    axiosClient.get<NotificationType>(`/api/notifications/${id}`),

  update: (id: string) =>
    axiosClient.put<NotificationType>(`/api/notifications/${id}`),

  delete: (id: string) => axiosClient.delete(`/api/notifications/${id}`),

  markAllRead: (role: string, id?: string) =>
    axiosClient.patch<{ success: boolean; modifiedCount: number }>(
      `/api/notifications/mark-all-read?role=${role}${id ? `&id=${id}` : ""}`
    ),

  createForUser: (data: {
    user: string;
    title: string;
    body: string;
    meta?: any;
  }) => axiosClient.post<NotificationType>("/api/notifications", data),

  // =========================
  // ADMIN NOTIFICATIONS
  // =========================
  getAllAdmin: (queryParams?: string) =>
    axiosClient.get<{
      notifications: NotificationType[];
      unreadCount: number;
      pagination: PaginationResponse;
    }>(`/api/notifications?${queryParams ?? ""}`),

  getByIdAdmin: (id: string) =>
    axiosClient.get<NotificationType>(`/api/notifications/${id}`),

  updateAdmin: (id: string) =>
    axiosClient.put<NotificationType>(`/api/notifications/${id}`),

  deleteAdmin: (id: string) => axiosClient.delete(`/api/notifications/${id}`),

  // ✅ Use PATCH here too
  markAllReadAdmin: () =>
    axiosClient.patch<{ success: boolean; modifiedCount: number }>(
      "/api/notifications/mark-all-read?role=admin"
    ),

  createForAdmin: (data: {
    isForAdmin: true;
    title: string;
    body: string;
    meta?: any;
  }) => axiosClient.post<NotificationType>("/api/admin/notifications", data),
};

export default notificationsApi;
