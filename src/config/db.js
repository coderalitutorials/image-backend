const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set in .env");

let isConnected = false; // global flag to track connection

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

