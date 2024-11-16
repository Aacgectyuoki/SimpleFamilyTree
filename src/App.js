// import React, { useState } from "react";
// import GedcomUploader from "./components/gedcomUploader";
// import FamilyTree from "./components/FamilyTree";

// const App = () => {
//   const [treeData, setTreeData] = useState(null);

//   const handleGedcomData = (data) => {
//     console.log("GEDCOM Data received in App.js:", data);
//     setTreeData(data);
//   };

//   return (
//     <div>
//       <h1 className="text-center text-2xl font-bold mb-4">Family Tree Viewer</h1>
//       <GedcomUploader onDataLoaded={handleGedcomData} />
//       {treeData ? (
//         <div className="mt-8">
//           <FamilyTree treeData={treeData} onNodeClick={console.log} />
//         </div>
//       ) : (
//         <p className="text-center mt-8 text-gray-500">No family tree data to display.</p>
//       )}
//     </div>
//   );
// };

// export default App;
import React, { useState } from "react";
import GedcomUploader from "./components/gedcomUploader";
import FamilyTree from "./components/FamilyTree";

const App = () => {
  const [treeData, setTreeData] = useState(null);

  const handleGedcomData = (data) => {
    console.log("Parsed GEDCOM Data:", data);
    setTreeData(data);
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold mb-4">Family Tree Viewer</h1>
      <GedcomUploader onDataLoaded={handleGedcomData} />
      {treeData ? (
        <div className="mt-8">
          <FamilyTree treeData={treeData} />
        </div>
      ) : (
        <p className="text-center mt-8 text-gray-500">No family tree data to display.</p>
      )}
    </div>
  );
};

export default App;

