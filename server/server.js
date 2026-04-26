require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const validateEnv = require("./config/envValidator");
const { errorHandler } = require("./middleware/errorMiddleware");
const workspaceSocket = require("./sockets/workspaceSocket");

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

// 3. Connect to MongoDB (Don't await to unblock server startup)
connectDB();

// 4. Global Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

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

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/channels", require("./routes/channels")); // Legacy mapped reference
app.use("/api/messages", require("./routes/messages")); // Legacy mapped reference

// 8. Error Boundary Middleware
app.use(errorHandler);

// 9. Boot Up
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running aggressively on port ${PORT}`);
  console.log(`🛡️  Strict Layered Architecture Active\n`);
});
