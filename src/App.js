import React, { useState } from 'react';
import GedcomUploader from './components/gedcomUploader';
import FamilyTree from './components/FamilyTree';

const App = () => {
  const [gedcomData, setGedcomData] = useState(null);

  const handleDataLoaded = (data) => {
    setGedcomData(data);
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