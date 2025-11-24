require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const imageRoutes = require("./src/routes/imageRoutes");
const { errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


  
const allowedOrigins = [
  "http://localhost:5173",                   // local dev
  "https://candid-ganache-4af8e6.netlify.app"  // deployed frontend
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});




connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/image", imageRoutes);

// health
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "AI Image Backend running" });
});

// error handler
app.use(errorHandler);

module.exports = app;
