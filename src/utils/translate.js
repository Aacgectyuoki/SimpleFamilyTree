import axios from "axios";

// MyMemory Translation API
const translateText = async (text, source = "en", target = "ar") => {
  try {
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,
        langpair: `${source}|${target}`,
      },
    });

    const translatedText = response.data.responseData.translatedText;

    if (translatedText && translatedText !== text) {
      return translatedText;
    }

    console.warn("Translation API returned the same text, falling back to original text.");
    return text; // Fallback to the original text if translation fails
  } catch (error) {
    console.error("Translation Error:", error.message);
    return text; // Fallback on error
  }
};

export default translateText;
