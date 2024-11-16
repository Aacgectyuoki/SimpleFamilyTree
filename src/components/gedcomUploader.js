import React, { useState } from "react";
import { parseGedcomFile } from "../services/gedcomParser";

const GedcomUploader = ({ onDataLoaded }) => {
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected");
      console.log("No file selected.");
      return;
    }
  
    console.log("Uploaded file:", file.name, file.size); // Log file name and size
  
    try {
      const gedcomData = await parseGedcomFile(file);
      console.log("Parsed GEDCOM Data:", gedcomData); // Log parsed data
      onDataLoaded(gedcomData);
      setError(null);
    } catch (err) {
      console.error("Failed to parse GEDCOM file:", err.message);
      setError("Failed to parse GEDCOM file: " + err.message);
    }
  };  

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".ged"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default GedcomUploader;
