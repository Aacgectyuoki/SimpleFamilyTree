import translations from "../translations";

export const t = (key, lang = "en") => translations[lang]?.[key] || key;
