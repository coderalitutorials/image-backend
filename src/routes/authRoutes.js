const express = require("express");
const router = express.Router();
const { register, login, saveApiKey, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// public
router.post("/register", register);
router.post("/login", login);

// protected
router.post("/save-api-key", authMiddleware, saveApiKey);
router.post("/logout", authMiddleware, logout); // <-- logout route

module.exports = router;

