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


  

app.use(cors({
 origin:"https://candid-ganache-4af8e6.netlify.app",
  credentials: true
}));



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
