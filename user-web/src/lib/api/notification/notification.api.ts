// @/lib/api/notificationsApi.ts
import axiosClient from "../client/axios";
import { NotificationType, PaginationResponse } from "@/lib/types";

export const notificationsApi = {
  getAll: (role: string, queryParams?: string) =>
    axiosClient.get<{
      notifications: NotificationType[];
      unreadCount: number;
      pagination: PaginationResponse;
    }>(
      `/api/notifications?role=${role}${queryParams ? `&${queryParams}` : ""}`
    ),

  getById: (id: string) =>
    axiosClient.get<{unreadCount : number , notifications : NotificationType[]}>(`/api/notifications/${id}`),

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
};

export default notificationsApi;
