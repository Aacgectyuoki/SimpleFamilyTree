import parseGEDCOM from 'gedcom-js';
import React from 'react';

const parseGedcomFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const target = e.target;
    if (!target) return;
    const gedcomData = target.result;
    const parsedData = parseGEDCOM.parse(gedcomData);
    console.log(parsedData); // Parsed tree structure
  };
  reader.readAsText(file);
};

// File input handler
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) parseGedcomFile(file);
};

// File input in component
const GedcomFileInput = () => (
  <input type="file" accept=".ged" onChange={handleFileUpload} />
);

export default GedcomFileInput;