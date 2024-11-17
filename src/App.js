import React, { useState } from "react";
import GedcomUploader from "./components/gedcomUploader";
import FamilyTree from "./components/FamilyTree";


const App = () => {
  const [gedcomData, setGedcomData] = useState(null);

  // Define the handler to log and set the data
  const handleDataLoaded = (data) => {
    console.log("Parsed GEDCOM data in App:", data); // Log the data
    setGedcomData(data); // Update the state
  };

  return (
    <div className="app">
      <h1 className="text-xl font-bold mb-4">GEDCOM Family Tree Viewer</h1>
      <GedcomUploader onDataLoaded={handleDataLoaded} />
      {gedcomData && <FamilyTree gedcomData={gedcomData} />}
    </div>
  );
};

export default App;
