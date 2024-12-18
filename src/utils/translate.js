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

    if (translatedText) {
      return translatedText;
    }

    console.warn("Translation API did not return a result, falling back to original text.");
    return text;
  } catch (error) {
    console.error("Translation Error:", error.message);
    return text;
  }
};

export default translateText;
