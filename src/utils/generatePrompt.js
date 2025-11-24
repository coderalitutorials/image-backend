const styles = require("./stylesPreset");

/**
 * Compose final prompt by combining user prompt and selected style key.
 * @param {String} userPrompt
 * @param {String} styleKey - key from stylesPreset.js
 */
function generatePrompt(userPrompt, styleKey) {
  const style = styles[styleKey] || "";
  // safe composition
  const final = style ? `${userPrompt.trim()}. Render this in: ${style}` : userPrompt.trim();
  return final;
}

module.exports = generatePrompt;
