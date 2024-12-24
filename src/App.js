import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import GEDCOMPage from "./components/GEDCOMPage";
import axios from "axios";

// Fallback translations
const fallbackTranslations = {
  en: {
    uploadFile: "Upload GEDCOM File",
    familyTree: "View Family Tree",
    home: "Home",
    arabic: "Arabic",
    english: "English",
  },
  ar: {
    uploadFile: "تحميل ملف GEDCOM",
    familyTree: "شجرة العائلة",
    home: "الصفحة الرئيسية",
    arabic: "العربيَّة",
    english: "الإنجليزية",
  },
};

const translateText = async (key, targetLang = "ar") => {
  const fallback = fallbackTranslations[targetLang][key];
  console.log(`Translation request: ${key} => ${targetLang}`);
  try {
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: fallbackTranslations.en[key], // Use English as the source
        langpair: `en|${targetLang}`,
      },
    });

    const translatedText = response.data.responseData.translatedText;
    if (translatedText && translatedText !== fallbackTranslations.en[key]) {
      console.log(`Translation Result: ${key} => ${translatedText}`);
      return translatedText;
    }
    console.warn("Translation API returned the same text or a placeholder.");
    return fallback; // Use fallback translations if API fails
  } catch (error) {
    console.error("Translation API Error:", error.message);
    return fallback; // Use fallback translations on error
  }
};


const App = () => {
  const [gedcomData, setGedcomData] = useState(null);
  const [language, setLanguage] = useState("en");
  const [translatedTitles, setTranslatedTitles] = useState({});

  // Fetch translations
  const fetchTranslations = async (language) => {
    const texts = ["uploadFile", "familyTree", "home", "arabic", "english"];
    const translated = {};
  
    for (let key of texts) {
      translated[key] = await translateText(key, language);
    }
  
    console.log("Translated Titles (fetched):", translated);
    setTranslatedTitles(translated);
  };

  // Update translations when language changes
  useEffect(() => {
    fetchTranslations();
  }, [language]);

  // Language toggle
  const handleLanguageToggle = async () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
    console.log(`Language changed: ${newLanguage}`);
    await fetchTranslations(newLanguage);
  };

  return (
    <div>
      <nav style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Home Link */}
        <Link to="/" style={{ textDecoration: "none", color: "blue", fontSize: "16px" }}>
          {translatedTitles.home || fallbackTranslations.en.home}
        </Link>

        {/* Family Tree Link */}
        {gedcomData && (
          <Link to="/diagram" style={{ textDecoration: "none", color: "blue", fontSize: "16px" }}>
            {translatedTitles.familyTree || fallbackTranslations.en.familyTree}
          </Link>
        )}

        {/* Language Toggle */}
        <label style={{ display: "flex", alignItems: "center", fontSize: "16px" }}>
          <input
            type="checkbox"
            checked={language === "ar"}
            onChange={handleLanguageToggle}
            style={{ marginRight: "5px" }}
          />
          {language === "en"
            ? fallbackTranslations.en.arabic
            : fallbackTranslations.ar.english}
        </label>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <GEDCOMPage
              gedcomData={gedcomData}
              onDataLoaded={setGedcomData}
              language={language}
              translations={translatedTitles}
            />
          }
        />
        <Route
          path="/diagram"
          element={
            <FamilyTreeDiagram gedcomData={gedcomData} language={language} />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
