import { translateText } from "./translateService";
import { textMap } from "./textMap";

export const loadTranslations = async (targetLang = "ar") => {
  if (Object.keys(textMap[targetLang]).length) return textMap[targetLang]; // Skip if already loaded

  const translations = {};
  for (const key in textMap.en) {
    translations[key] = await translateText(textMap.en[key], targetLang);
  }

  textMap[targetLang] = translations;
  return translations;
};
