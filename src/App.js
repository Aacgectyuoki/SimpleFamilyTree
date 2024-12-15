import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import GEDCOMPage from "./components/GEDCOMPage";

const translations = {
  en: {
    uploadGedcom: "Upload GEDCOM File",
    viewFamilyTree: "View Family Tree",
    uploadFile: "Upload a GEDCOM file to visualize your family tree.",
    title: "GEDCOM Family Tree Viewer",
    arabicToggle: "Arabic",
  },
  ar: {
    uploadGedcom: "تحميل ملف GEDCOM",
    viewFamilyTree: "عرض شجرة العائلة",
    uploadFile: "قم بتحميل ملف GEDCOM لعرض شجرة العائلة الخاصة بك.",
    title: "عارض شجرة العائلة GEDCOM",
    arabicToggle: "الإنجليزية",
  },
};

const App = () => {
  const [gedcomData, setGedcomData] = useState(null);
  const [language, setLanguage] = useState("en");

  const handleDataLoaded = (data) => {
    console.log("GEDCOM data loaded:", data);
    setGedcomData(data);
  };

  const handleLanguageToggle = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "ar" : "en"));
  };

  return (
    <div className="app" style={{ width: "80%", margin: "0 auto" }}>
      <nav style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Link to="/">{translations[language].uploadGedcom}</Link>
          {gedcomData && (
            <Link to="/diagram" style={{ marginLeft: "20px" }}>
              {translations[language].viewFamilyTree}
            </Link>
          )}
        </div>
        <label className="switch">
          <input type="checkbox" onChange={handleLanguageToggle} />
          <span className="slider"></span>
        </label>
        <span>{translations[language].arabicToggle}</span>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <GEDCOMPage
              gedcomData={gedcomData}
              onDataLoaded={handleDataLoaded}
              language={language}
              translations={translations[language]}
            />
          }
        />
        <Route
          path="/diagram"
          element={
            gedcomData ? (
              <FamilyTreeDiagram
                gedcomData={gedcomData}
                language={language}
                translations={translations[language]}
              />
            ) : (
              <p>{translations[language].uploadPrompt}</p>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
