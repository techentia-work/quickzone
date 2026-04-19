import { Server as SocketIOServer } from "socket.io";

declare global {
  var socketIO: SocketIOServer | undefined;
}

export function setIO(serverIO: SocketIOServer) {
  global.socketIO = serverIO;
  console.log("✅ Socket.IO instance stored globally");
}

export function getIO(): SocketIOServer | null {
  if (!global.socketIO) {
    console.warn("⚠️ Socket.IO not initialized yet");
    return null;
  }
  return global.socketIO;
}