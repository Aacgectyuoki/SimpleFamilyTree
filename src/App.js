import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import FamilyTree from "./components/FamilyTree";
import GEDCOMPage from "./components/GEDCOMPage";

const App = () => {
  const [gedcomData, setGedcomData] = useState(null);

  const handleDataLoaded = (data) => {
    console.log("GEDCOM data loaded:", data);
    setGedcomData(data);
  };

  return (
    <div className="app"
      style={{
        width: "80%", // Set the width to 80%
        height: "80vh", // Keep the height as full viewport
        margin: "0 auto", // Center the container horizontally
      }}
    >
      <nav>
        <Link to="/">Upload GEDCOM</Link>
        {gedcomData && <Link to="/diagram">View Family Tree</Link>}
      </nav>
      <Routes>
        {/* GEDCOM Upload Page */}
        <Route
          path="/"
          element={<GEDCOMPage gedcomData={gedcomData} onDataLoaded={handleDataLoaded} />}
        />
        {/* Family Tree Diagram Page */}
        <Route
          path="/diagram"
          element={
            gedcomData ? (
              <FamilyTreeDiagram gedcomData={gedcomData} />
            ) : (
              <p>Please upload a GEDCOM file to view the family tree.</p>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;