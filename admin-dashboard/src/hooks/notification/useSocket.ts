// @/hooks/useAdminSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { socketClientUtils } from "@/lib/utils/socket.client.utils";
import { NotificationType } from "@/lib/types";
import { useAdminNotification } from "./useAdminNotification";

export function useAdminSocket(isEnabled: boolean = true) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<string[]>([]);

  const { refetchNotifications } = useAdminNotification();

  useEffect(() => {

    if(!isEnabled) return;
    // ✅ Initialize socket connection
    socketRef.current = socketClientUtils.getSocket();
    const socket = socketRef.current;

    // ✅ Join the admin room
    const room = "admins";
    socketClientUtils.joinRoom(room);
    joinedRoomsRef.current.push(room);

    // ✅ Listen for correct event
    const handleAdminNotification = (notification: NotificationType) => {
      console.log("🛎️ Admin notification received:", notification);

      // 🔥 Broadcast to any listening component
      window.dispatchEvent(
        new CustomEvent("new-notification", { detail: notification })
      );
      refetchNotifications();
    };

    socket.on("notification:new", handleAdminNotification);

    // ✅ Cleanup on unmount
    return () => {
      socket.off("notification:new", handleAdminNotification);
      joinedRoomsRef.current.forEach((room) => {
        socketClientUtils.leaveRoom(room);
      });
      joinedRoomsRef.current = [];
    };
  }, []);

  return socketRef.current;
}
