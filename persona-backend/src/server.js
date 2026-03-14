const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ---- GLOBAL MIDDLEWARE ----
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---- HEALTH CHECK ----
app.get("/health", (_, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ---- ROUTES ----
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/notifications", require("./routes/notifications"));

// ---- CRON (ISOLATED) ----
require("./jobs/reminder.job");

// ---- DATABASE ----
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/persona", {
    autoIndex: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ---- PROCESS SAFETY ----
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 LifeOS backend running on port ${PORT}`)
);
