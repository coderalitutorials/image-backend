const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
      token
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not existed" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "wrong email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name, apiKey: user.apiKey, creditsLeft: user.creditsLeft },
      token
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Save user's personal API key (HF or Stability) and reset creditsLeft
 * Body: { apiKey: "hf_xxx" }
 */
const saveApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ message: "apiKey required" });

    const user = await User.findById(req.user._id);
    user.apiKey = apiKey.trim();
    user.creditsLeft = 5; // reset to free quota (adjust if needed)
    await user.save();

    res.json({ success: true, apiKey: !!user.apiKey, creditsLeft: user.creditsLeft });
  } catch (err) {
    console.error("saveApiKey error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



const logout = (req, res) => {
  // Frontend will delete token, backend doesn’t need to do anything
  res.json({ success: true, message: "Logged out" });
};



module.exports = { register, login, saveApiKey,logout };
