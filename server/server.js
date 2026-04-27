require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const validateEnv = require("./config/envValidator");
const { errorHandler, requestLogger } = require("./middleware/errorMiddleware");
const { csrfProtection } = require("./middleware/csrfMiddleware");
const workspaceSocket = require("./sockets/workspaceSocket");
const rateLimit = require("express-rate-limit");

const defaultOrigins = [
  "http://localhost:3000",
  "https://project-nexuspace.vercel.app",
];

const envOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

// 1. Validate Environment Variables
validateEnv();

// 2. Initialize Express app
const app = express();
const server = http.createServer(app);
app.set("trust proxy", true); // Respect X-Forwarded-For from all proxies (Render/Cloudflare)

// 3. Connect to MongoDB (Don't await to unblock server startup)
connectDB();

// 4. Global Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "Cookie"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Global Rate Limiter (100 req/min)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests", code: "RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Global CSRF Protection (Only affects POST/PUT/PATCH/DELETE)
app.use(csrfProtection);

// 5. Initialize Socket.io (WebSocket Layer)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
workspaceSocket(io); // Attach defined namespace handlers

// 6. Router IoC Injection
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 7. REST Routes Mapping
app.get("/", (req, res) =>
  res.send("Nexuspace API Layered Architecture Running..."),
);

// Health & Readiness Endpoints
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));
app.get("/ready", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) throw new Error("DB not ready");
    res.status(200).json({ status: "READY" });
  } catch (err) {
    res.status(503).json({ status: "UNAVAILABLE", details: err.message });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/channels", require("./routes/channels")); // Legacy mapped reference
app.use("/api/messages", require("./routes/messages")); // Legacy mapped reference
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 8. Error Boundary Middleware
app.use(errorHandler);

// 9. Boot Up
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running aggressively on port ${PORT}`);
  console.log(`🛡️  Strict Layered Architecture Active\n`);
});

// 10. Graceful Shutdown Hooks
const gracefulShutdown = () => {
  console.log("\n[Shutdown] SIGTERM or SIGINT received. Draining connections...");
  server.close(async () => {
    console.log("[Shutdown] HTTP server closed.");
    
    // Close MongoDB
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close(false);
      console.log("[Shutdown] MongoDB connection closed.");
    }
    
    // Close Redis
    try {
      const redis = require("./config/redis");
      if (redis && typeof redis.quit === 'function') {
        await redis.quit();
        console.log("[Shutdown] Redis connection closed.");
      }
    } catch (e) {
      console.log("[Shutdown] Redis closure error:", e.message);
    }
    
    process.exit(0);
  });
  
  // Force close after 10s timeout
  setTimeout(() => {
    console.error("[Shutdown] Could not drain connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
