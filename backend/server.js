import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import hpp from "hpp";

import userRouter from "./routes/userRoute.js";
import connectDB from "./config/db.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// ✅ Trust proxy (important for Render, Railway)
app.set("trust proxy", 1);

// 🔐 Security (only in production for faster dev + startup)
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  app.use(hpp());
}

// ⚡ Compression (optimized)
app.use(
  compression({
    threshold: 1024, // only compress >1kb
  }),
);

// 🚫 Rate limit (lightweight)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // increased to reduce blocking
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// 🔐 Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/user/forgot-password", authLimiter);
app.use("/api/user/reset-password", authLimiter);

// 🌐 CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// 📦 Body parser (optimized)
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// 📁 Static
app.use("/uploads", express.static("uploads"));

// 📊 Logging (NO file write = faster)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny"));
}

// 🚏 Routes
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);

// 🏠 Health check (important for uptime bots)
app.get("/", (req, res) => {
  res.send("API WORKING 🚀");
});

// ❌ 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 🔥 Error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// 🚀 START SERVER FIRST (IMPORTANT)
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);

  // 🔥 Connect DB AFTER server start (faster first response)
  connectDB()
    .then(() => console.log("✅ DB Connected"))
    .catch((err) => console.error("❌ DB Error:", err.message));
});

// 🛑 Graceful shutdown
process.on("SIGINT", () => process.exit(0));
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("❌ Rejection:", err.message);
});
