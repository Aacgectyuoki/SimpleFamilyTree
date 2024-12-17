import axios from "axios";

/**
 * Translates text using MyMemory API.
 * @param {string} text - The text to translate.
 * @param {string} source - Source language code (e.g., "en").
 * @param {string} target - Target language code (e.g., "ar").
 * @returns {Promise<string>} - Translated text or original text on error.
 */
const translateText = async (text, source = "en", target = "ar") => {
  if (!text || typeof text !== "string") {
    console.warn("Invalid text input for translation:", text);
    return text;
  }

  try {
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,                 // Text to translate
        langpair: `${source}|${target}`, // Language pair: source|target
      },
    });

    // Check if translation is successful
    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      return response.data.responseData.translatedText;
    } else {
      console.warn("Unexpected response structure:", response.data);
      return text; // Fallback to original text
    }
  } catch (error) {
    console.error("Translation Error:", error.message || error);
    return text; // Return original text as fallback
  }
};

export default translateText;
