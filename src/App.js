import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import GEDCOMPage from "./components/GEDCOMPage";
import translations from "./translations";

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

  const t = (key) => translations[language]?.[key] || key;

  return (
    <div className="app">
      <nav>
        <Link to="/">{t("gedcomUpload")}</Link>
        {gedcomData && <Link to="/diagram">{t("familyTree")}</Link>}
        <label style={{ marginLeft: "20px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={language === "ar"}
            onChange={handleLanguageToggle}
            style={{ marginRight: "5px" }}
          />
          {language === "en" ? t("arabic") : t("english")}
        </label>
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
              <p>{translations[language].uploadFile}</p>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
