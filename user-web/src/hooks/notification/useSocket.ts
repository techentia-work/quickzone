"use client"
import { socketClientUtils } from "@/lib/utils/socket.client.utils";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";

export function useSocket() {
  const { user } = useAuth();
  

  useEffect(() => {
    if (!user?._id) return;
    

    const socket = socketClientUtils.getSocket();
    socketClientUtils.joinRoom(user._id); // 👈 join their personal room

    socket.on("notification:new", (data) => {
      // console.log("🔔 New notification:", data);
      // handle UI update, toast, etc.
    });

    return () => {
      socketClientUtils.leaveRoom(user._id);
    };
  }, [user?._id]);
}