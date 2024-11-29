import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import FamilyTreeDiagram from "./components/FamilyTreeDiagram";
import GEDCOMPage from "./components/GEDCOMPage";

const App = () => {
  const [gedcomData, setGedcomData] = useState(null);

  const handleDataLoaded = (data) => {
    console.log("GEDCOM data loaded:", data);
    setGedcomData(data);
  };

  return (
    <div className="app">
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





// import React, { useState } from "react";
// import GedcomUploader from "./components/gedcomUploader";
// import FamilyTree from "./components/FamilyTree";
// import FamilyTreeDiagram from "./components/FamilyTreeDiagram";


// const App = () => {
//   const [gedcomData, setGedcomData] = useState(null);

//   // Define the handler to log and set the data
//   const handleDataLoaded = (data) => {
//     console.log("Parsed GEDCOM data in App:", data); // Log the data
//     setGedcomData(data); // Update the state
//   };

//   return (
//     <div className="app">
//       {/* <h1 className="text-xl font-bold mb-4">GEDCOM Family Tree Viewer</h1> */}
//       {/* <GedcomUploader onDataLoaded={handleDataLoaded} />
//       {gedcomData && <FamilyTree gedcomData={gedcomData} />} */}
//       <GedcomUploader onDataLoaded={handleDataLoaded} />
//       {gedcomData && <FamilyTreeDiagram gedcomData={gedcomData} />}
//     </div>
//   );
// };

// export default App;