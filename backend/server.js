import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import hpp from "hpp";
import fs from "fs";
import path from "path";

import userRouter from "./routes/userRoute.js";
import connectDB from "./config/db.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// 📁 Create logs folder (for production logs)
const __dirname = path.resolve();
const logDir = path.join(__dirname, "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 📄 Log stream
const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

// ✅ Trust proxy (important for Render, Railway, etc.)
app.set("trust proxy", 1);

// 🔐 Security middlewares
app.use(helmet());
app.use(hpp());
app.use(compression());

// 🚫 Global rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  }),
);

// 🔐 Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts, please try again later.",
});

app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/user/forgot-password", authLimiter);
app.use("/api/user/reset-password", authLimiter);

// 🌐 CORS (safe config)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// 📦 Body parsing (prevent large payload attacks)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 📁 Static files
app.use("/uploads", express.static("uploads"));

// 📊 Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: accessLogStream }));
}

// 🚏 Routes
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);

// 🏠 Health check
app.get("/", (req, res) => {
  res.send("API WORKING 🚀");
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 🔥 Global error handler (clean + safe)
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// 🛑 Graceful shutdown (better version)
process.on("SIGINT", () => {
  console.log("🛑 Gracefully shutting down...");
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// 🚀 Start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  });
