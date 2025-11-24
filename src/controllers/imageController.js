const axios = require("axios");
const generatePrompt = require("../utils/generatePrompt");
const User = require("../models/User");

const HF_NEBIUS_URL = "https://router.huggingface.co/nebius/v1/images/generations";

/**
 * POST /api/image/generate
 * Body: { prompt: string, styleKey: string }
 */
const generateImage = async (req, res) => {
  try {
    const { prompt, styleKey } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt required" });

    // choose which API key to use
    const dbUser = await User.findById(req.user._id);
    const useUserKey = dbUser.apiKey && dbUser.apiKey.length > 10;
    if (useUserKey && dbUser.creditsLeft <= 0) {
      return res.status(403).json({ forceLogout: true, message: "User credits finished" });
    }

    const finalPrompt = generatePrompt(prompt, styleKey);

    const apiKeyToUse = useUserKey ? dbUser.apiKey : process.env.HF_API_KEY;
    if (!apiKeyToUse) {
      return res.status(500).json({ message: "No server API key configured. Ask user to provide their API key." });
    }

    const response = await axios.post(
      HF_NEBIUS_URL,
      {
        model: "black-forest-labs/flux-schnell",
        prompt: finalPrompt,
        response_format: "b64_json"
      },
      {
        headers: {
          Authorization: `Bearer ${apiKeyToUse}`,
          "Content-Type": "application/json"
        },
        timeout: 120000
      }
    );

    // HF Nebius returns data.data[0].b64_json
    const b64 = response.data?.data?.[0]?.b64_json;
    if (!b64) {
      console.error("HF returned unexpected payload:", response.data);
      return res.status(500).json({ message: "Invalid response from image provider", details: response.data });
    }

    // decrement user's credits if user key used
    if (useUserKey) {
      dbUser.creditsLeft = Math.max(0, dbUser.creditsLeft - 1);
      await dbUser.save();
    }

    res.json({ success: true, image: `data:image/png;base64,${b64}`, creditsLeft: dbUser.creditsLeft || null });
  } catch (err) {
    console.error("imageController error:", err.response?.data || err.message);
    const details = err.response?.data || err.message;
    // If user token invalid -> treat as auth error for provider
    if (err.response?.status === 401 || (details && typeof details === "string" && details.includes("Invalid username"))) {
      return res.status(400).json({ message: "Provider authentication failed", details });
    }
    res.status(500).json({ message: "Image generation failed", details });
  }
};

module.exports = { generateImage };
