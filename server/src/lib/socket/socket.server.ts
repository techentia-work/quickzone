import { Server as SocketIOServer } from "socket.io";
import { setIO } from "../config/socket/socket";

// --- TYPES & CONFIG ---
const MAX_CONCURRENT_CONNECTIONS_PER_IP = 5;
const MAX_CONNECTION_ATTEMPTS_PER_MINUTE = 10;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes block for abusive IPs

interface IPStats {
  activeSockets: Set<string>;
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

const ipRegistry = new Map<string, IPStats>();

// --- UTILS ---
const getIPStats = (ip: string): IPStats => {
  if (!ipRegistry.has(ip)) {
    ipRegistry.set(ip, {
      activeSockets: new Set(),
      attempts: 0,
      lastAttempt: Date.now(),
      blockedUntil: 0,
    });
  }
  return ipRegistry.get(ip)!;
};

// Periodic cleanup of registry to prevent memory leaks from stale IPs
setInterval(() => {
  const now = Date.now();
  for (const [ip, stats] of ipRegistry.entries()) {
    if (stats.activeSockets.size === 0 && now - stats.lastAttempt > COOLDOWN_MS) {
      ipRegistry.delete(ip);
    }
  }
}, 300000); // 5 minutes

export function initSocket(server: any) {
  if (global.socketIO) {
    console.log("♻️ Socket.IO already initialized");
    return global.socketIO;
  }

  console.log("🔌 Initializing PRODUCTION Socket.IO Hardening...");

  const io = new SocketIOServer(server, {
    path: "/socket.io",
    transports: ["websocket"], // 🚀 Force WebSocket for performance & security
    pingTimeout: 5000,         // Faster cleanup
    pingInterval: 10000,
    maxHttpBufferSize: 1e6,    // 1MB limit
    connectTimeout: 10000,
    cors: {
      origin: true, // Controlled by Express CORS
      credentials: true,
    },
  });

  // --- CONNECTION GUARD MIDDLEWARE ---
  io.use((socket, next) => {
    const ip = socket.handshake.address;
    const now = Date.now();
    const stats = getIPStats(ip);

    // 1. Check Cooldown
    if (stats.blockedUntil > now) {
      console.warn(`🛡️  Socket connection REJECTED (Cooldown): ${ip}`);
      return next(new Error("IP temporarily blocked due to excessive connections"));
    }

    // 2. Reset attempt counter if window passed
    if (now - stats.lastAttempt > 60000) {
      stats.attempts = 0;
    }

    stats.attempts++;
    stats.lastAttempt = now;

    // 3. Threshold Check (Flood)
    if (stats.attempts > MAX_CONNECTION_ATTEMPTS_PER_MINUTE) {
      stats.blockedUntil = now + COOLDOWN_MS;
      console.error(`🚨 IP BLOCKED (Flood detected): ${ip}`);
      return next(new Error("Excessive connection attempts. Cooldown active."));
    }

    // 4. Concurrency Check
    if (stats.activeSockets.size >= MAX_CONCURRENT_CONNECTIONS_PER_IP) {
      console.warn(`🛡️  Socket connection REJECTED (Max per IP): ${ip}`);
      return next(new Error("Maximum active connections reached for this IP"));
    }

    next();
  });

  setIO(io);

  io.on("connection", (socket) => {
    const ip = socket.handshake.address;
    const stats = getIPStats(ip);
    stats.activeSockets.add(socket.id);

    // Throttled connection log
    if (stats.activeSockets.size === 1) {
      console.log(`✅ Socket connected [${socket.id}] - IP: ${ip}`);
    }

    socket.on("join", (room: string) => {
      if (typeof room !== "string" || !room) return;
      socket.join(room);
    });

    socket.on("error", (err) => {
      // Prevent log spam on common errors
      if (err.message !== "client document visible") {
        console.error(`🔴 Socket Error [${socket.id}]:`, err.message);
      }
    });

    socket.on("disconnect", (reason) => {
      stats.activeSockets.delete(socket.id);
      // Optional: Log only if requested or if specific reason
      if (reason !== "transport close" && reason !== "client namespace disconnect") {
         console.log(`❌ Socket disconnected [${socket.id}]: ${reason}`);
      }
    });
  });

  global.socketIO = io;
  console.log("✅ Socket.IO Hardening Enabled [IP Limit: 5, Rate: 10/min]");
  return io;
}
