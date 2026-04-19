import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const socketClientUtils = {
  getSocket(token?: string): Socket {
    if (socketInstance) return socketInstance;

    socketInstance = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: token ? { token } : undefined, // <-- send JWT in handshake
    });

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
