import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import GEDCOMPage from "./components/GEDCOMPage";
import translateText from "./utils/translate";

const App = () => {
  // State variables for GEDCOM data, language, and translated UI texts
  const [gedcomData, setGedcomData] = useState(null);
  const [language, setLanguage] = useState("en");
  const [translatedTitles, setTranslatedTitles] = useState({
    // gedcomUpload: "Upload GEDCOM File",
    // familyTree: "View Family Tree",
    // arabic: "العربية",
    // english: "English",
  });

  const fetchTranslations = async () => {
    const texts = [
      { key: "uploadFile", value: "Upload GEDCOM File" },
      { key: "familyTree", value: "View Family Tree" },
      { key: "arabic", value: "Arabic" },
      { key: "english", value: "English" },
    ];

    const translated = {};
    for (let { key, value } of texts) {
      translated[key] = await translateText(value, "en", language);
    }
    setTranslatedTitles(translated);
  };

  useEffect(() => {
    fetchTranslations();
  }, [language]);

  const handleLanguageToggle = async () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  
    const texts = [
      { key: "uploadFile", value: "Upload GEDCOM File" },
      { key: "familyTree", value: "View Family Tree" },
      { key: "arabic", value: "Arabic" },
      { key: "english", value: "English" },
    ];
  
    // Fetch translations dynamically for selected languages
    const translated = {};
    for (let { key, value } of texts) {
      const translatedValue = await translateText(value, "en", newLanguage);
      translated[key] = newLanguage === "ar" ? translatedValue : value; // English fallback
    }
    setTranslatedTitles(translated);
  };
  
  // const handleLanguageToggle = () => {
  //   setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  // };

return (
  <div>
    <nav>
      <Link to="/">{translatedTitles.uploadFile || "Loading..."}</Link>
      {gedcomData && <Link to="/diagram">{translatedTitles.familyTree}</Link>}
      <label>
        <input
          type="checkbox"
          checked={language === "ar"}
          onChange={handleLanguageToggle}
        />
        {language === "en"
          ? translatedTitles.arabic || "Arabic"
          : translatedTitles.english || "English"}
      </label>
    </nav>
    <Routes>
      <Route
        path="/"
        element={<GEDCOMPage gedcomData={gedcomData} 
                      // onDataLoaded={handleDataLoaded} 
                      language={language} 
                      translations={translatedTitles} />}
      />
      <Route
        path="/diagram"
        element={<FamilyTreeDiagram gedcomData={gedcomData} language={language} />}
      />
    </Routes>
  </div>
);
};

export default App;