import axios from "axios";

const translationCache = {};

// Function to translate text dynamically
export const translateText = async (text, targetLang = "ar") => {
  if (!text) return "";

  // Check the cache first
  const cacheKey = `${text}-${targetLang}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,
        langpair: `en|${targetLang}`,
      },
    });
    const translatedText = response.data.responseData.translatedText || text;

    // Store in cache
    translationCache[cacheKey] = translatedText;

    return translatedText;
  } catch (error) {
    console.error("Translation API Error:", error);
    return text; // Return original text on failure
  }
};
