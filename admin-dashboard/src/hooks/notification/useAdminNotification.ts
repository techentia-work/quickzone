// @/hooks/useAdminNotification.ts
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect } from "react";
import { NotificationType, PaginationResponse } from "@/lib/types";
import toast from "react-hot-toast";
import notificationsApi from "@/lib/api/notification/notification.api";
import { socketClientUtils } from "@/lib/utils/socket.client.utils";

export const useAdminNotification = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationType | null>(null);

  // -------------------- QUERIES --------------------
  const {
    data,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["admin", "notifications", queryParams],
    queryFn: async () => {
      const res = await notificationsApi.getAll(queryParams ?? "admin");
      console.log("Unread count:", res.data?.unreadCount);
      return {
        notifications: res.data?.notifications || [],
        unreadCount: res.data?.unreadCount ?? 0,
      };
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const notifications = data?.notifications || [];
  let unreadCount = data?.unreadCount ?? 0;

  // -------------------- SOCKET LISTENERS --------------------
  useEffect(() => {
    const socket = socketClientUtils.getSocket();

    const handleNotification = (notification: NotificationType) => {
      console.log("🔔 New notification received:", notification);

      // Refetch notifications to update the list
      refetchNotifications();

      // Update unread count
      unreadCount += 1;

      // Show toast
      toast.success(notification.title, {
        icon: "🔔",
        duration: 4000,
      });

      // Dispatch custom event for NotificationBell component
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("new-notification", { detail: notification })
        );
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [refetchNotifications]);

  // -------------------- MUTATIONS --------------------
  const deleteAdminNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      toast.success("Admin notification deleted");
    },
    onError: (error) => {
      console.error("Error deleting admin notification:", error);
      toast.error("Failed to delete admin notification");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllReadAdmin(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      unreadCount = 0;
    },
    onError: (error) => {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    },
  });

  // -------------------- HELPERS --------------------
  const getNotificationByIdAdmin = useCallback(async (id: string) => {
    try {
      const res = await notificationsApi.getByIdAdmin(id);
      const notiData = res?.data;
      if (notiData) setSelectedNotification(notiData);
      return notiData;
    } catch (error) {
      console.error("Error fetching admin notification by ID:", error);
      throw error;
    }
  }, []);

  // -------------------- COMPUTED --------------------
  const isMutating = useMemo(
    () =>
      deleteAdminNotificationMutation.isPending ||
      markAllReadMutation.isPending,
    [deleteAdminNotificationMutation.isPending, markAllReadMutation.isPending]
  );

  return {
    // Data
    notifications,
    selectedNotification,

    // Loading states
    isLoadingNotifications,
    isMutating,

    // Error states
    notificationsError,

    // Refetch
    refetchNotifications,

    // CRUD
    getNotificationByIdAdmin,

    // Mutations
    mutations: {
      delete: deleteAdminNotificationMutation,
      markAllRead: markAllReadMutation,
    },

    // State
    setSelectedNotification,
    clearSelectedNotification: () => setSelectedNotification(null),

    // Computed
    unreadCount,
  };
};
