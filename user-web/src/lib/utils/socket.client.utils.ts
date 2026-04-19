import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const socketClientUtils = {
  getSocket(token?: string): Socket {
    if (socketInstance) return socketInstance;

    socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://api.quickzon.in" : "http://localhost:8080"),
      {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        withCredentials: true,
        auth: token ? { token } : undefined,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 20000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("🟢 Connected to Socket.IO:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (error: Error) => {
      console.error("❌ Socket.IO connection error:", error);
    });

    socketInstance.on("disconnect", (reason: string) => {
      console.log("🔴 Socket.IO disconnected:", reason);
    });

    return socketInstance;
  },

  joinRoom(roomId: string): void {
    if (!roomId) return;
    console.log("Room id" , roomId);
    
    const socket = this.getSocket();
    socket.emit("join", roomId);
    console.log(`📦 Joined room: ${roomId}`);
  },

  leaveRoom(roomId: string): void {
    const socket = this.getSocket();
    socket.emit("leave", roomId);
    console.log(`📤 Left room: ${roomId}`);
  },

  disconnect(): void {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      console.log("🔌 Socket.IO manually disconnected");
    }
  },

  isConnected(): boolean {
    return socketInstance?.connected ?? false;
  },
};
