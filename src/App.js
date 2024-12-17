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

  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  /**
   * Handles the data loaded from GEDCOM file
   * @param {object} data - GEDCOM data loaded
   */
//   const handleDataLoaded = (data) => {
//     setGedcomData(data);
//   };

//   const testTranslation = async () => {
//     const englishText = "Hello, how are you?";
//     const arabicText = await translateText(englishText, "en", "ar");
//     console.log("Translated Text:", arabicText);
//   };
  
//   testTranslation();

//   /**
//    * Handles the toggle of the language between 'en' and 'ar'
//    */
//   const handleLanguageToggle = async () => {
//     const newLanguage = language === "en" ? "ar" : "en";
//     setLanguage(newLanguage);

//     if (newLanguage === "ar") {
//       console.log("Translating to Arabic...");

//       try {
//         const translations = await Promise.allSettled([
//           translateText("Upload GEDCOM File", "en", "ar"),
//           translateText("View Family Tree", "en", "ar"),
//           translateText("Arabic", "en", "ar"),
//           translateText("English", "en", "ar"),
//         ]);

//         // Map through the translations and only use the successful translations
//         const successfulTranslations = translations.map((result, index) =>
//           result.status === "fulfilled" ? result.value : `Error ${index}`
//         );

//         console.log("Translations:", successfulTranslations);
        
//         setTranslatedTitles({
//           gedcomUpload: successfulTranslations[0] || "Upload GEDCOM File",
//           familyTree: successfulTranslations[1] || "View Family Tree",
//           arabic: successfulTranslations[2] || "العربية",
//           english: successfulTranslations[3] || "English",
//         });
//       } catch (error) {
//         console.error("Translation Error during language toggle:", error);
//       }
//     } else {
//       // Reset to default English titles if language is switched back to English
//       setTranslatedTitles({
//         gedcomUpload: "Upload GEDCOM File",
//         familyTree: "View Family Tree",
//         arabic: "العربية",
//         english: "English",
//       });


//     }
//   };

//   return (
//     <div className="app">
//       {/* Navigation Links */}
//       <nav>
//         <Link to="/">{translatedTitles.gedcomUpload}</Link>
//         {gedcomData && <Link to="/diagram">{translatedTitles.familyTree}</Link>}
        
//         {/* Language Toggle Checkbox */}
//         <label style={{ marginLeft: "20px", cursor: "pointer" }}>
//           <input
//             type="checkbox"
//             checked={language === "ar"}
//             onChange={handleLanguageToggle}
//             style={{ marginRight: "5px" }}
//           />
//           {language === "en" ? translatedTitles.arabic : translatedTitles.english}
//         </label>
//       </nav>

//       {/* Route Definitions */}
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <GEDCOMPage 
//               gedcomData={gedcomData} 
//               onDataLoaded={handleDataLoaded} 
//               language={language} 
//               translations={translatedTitles} 
//             />
//           }
//         />
//         <Route
//           path="/diagram"
//           element={
//             gedcomData ? (
//               <FamilyTreeDiagram 
//                 gedcomData={gedcomData} 
//                 language={language} 
//               />
//             ) : (
//               <p>{translatedTitles.gedcomUpload}</p>
//             )
//           }
//         />
//       </Routes>
//     </div>
//   );
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