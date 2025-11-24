const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  apiKey: { type: String, default: "" }, // optional user-provided HF/Stability key
  creditsLeft: { type: Number, default: 5 }, // reset on apiKey update
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
