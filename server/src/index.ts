import "dotenv/config";
import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes/index";
import { errorHandler } from "./lib/middlewares/index";
import db from "./lib/config/db/index";
import http from "http";
import { initSocket } from "./lib/socket/socket.server";
import path from "path";

// --- MIDDLEWARES ---
const logger = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(`🕒 SLOW REQUEST: ${req.method} ${req.originalUrl} - ${duration}ms`);
    } else {
      console.log(`📡 ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  next();
};

const PORT = parseInt(process.env.PORT || "8080");
const app = Express();
app.set("trust proxy", true);

// 1. Health check (Top priority, no middleware)
app.get("/health", (_, res) => res.status(200).json({ status: "ok", timestamp: new Date() }));

// 2. Logging & Basic Middlewares
app.use(logger);

const server = http.createServer(app);
initSocket(server);

db();

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://quickzon.in",
  "https://admin.quickzon.in",
  "https://www.quickzon.in",
  "https://www.admin.quickzon.in",
  "https://quickzone-one.vercel.app",
  "https://sacred-foal-secondly.ngrok-free.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  "/uploads",
  Express.static(path.join(process.cwd(), "uploads"))
);
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiRouter);
app.use(errorHandler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// app.use('/api', (req, res, next) => {
//     console.log('=== Request Debug Info ===');
//     console.log('URL:', req.url);
//     console.log('Method:', req.method);
//     console.log('Cookies:', req.cookies);
//     console.log('Cookie header:', req.headers.cookie);
//     console.log('========================');
//     next();
// });
