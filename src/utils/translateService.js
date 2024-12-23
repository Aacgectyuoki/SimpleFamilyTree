import axios from "axios";

const translationCache = {};
const predefinedTranslations = {
  en: {
    JAN: "January",
    FEB: "February",
    MAR: "March",
    APR: "April",
    MAY: "May",
    JUN: "June",
    JUL: "July",
    AUG: "August",
    SEP: "September",
    OCT: "October",
    NOV: "November",
    DEC: "December",
    ABT: "About",
  },
  ar: {
    JAN: "يناير",
    FEB: "فبراير",
    MAR: "مارس",
    APR: "أبريل",
    MAY: "مايو",
    JUN: "يونيو",
    JUL: "يوليو",
    AUG: "أغسطس",
    SEP: "سبتمبر",
    OCT: "أكتوبر",
    NOV: "نوفمبر",
    DEC: "ديسمبر",
    ABT: "تقريبًا",
  },
};

// Translate text dynamically with caching
export const translateText = async (text, targetLang = "ar") => {
  if (!text) return "";

  // Check predefined translations first
  if (predefinedTranslations[targetLang][text]) {
    return predefinedTranslations[targetLang][text];
  }

  // Check the cache
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

    // Cache the result
    translationCache[cacheKey] = translatedText;

    return translatedText;
  } catch (error) {
    console.error("Translation API Error:", error);
    return text; // Fallback to original text
  }
};