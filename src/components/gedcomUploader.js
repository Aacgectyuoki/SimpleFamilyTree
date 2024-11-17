import React, { useState } from "react";
import { parseGedcomFile } from "../services/gedcomParser";

const GedcomUploader = ({ onDataLoaded }) => {
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected");
      return;
    }

    try {
      const parsedData = await parseGedcomFile(file);
      onDataLoaded(parsedData);
      setError(null);
    } catch (err) {
      console.error("Error parsing GEDCOM file:", err);
      setError("Failed to parse GEDCOM file. Please check the format and try again.");
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".ged"
        aria-label="file"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default GedcomUploader;


// import React, { useState } from 'react';
// import { parseGedcomFile } from '../services/gedcomParser';

// const GedcomUploader = ({ onDataLoaded }) => {
//   const [error, setError] = useState(null);

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) {
//       setError("No file selected");
//       console.log("No file selected.");
//       return;
//     }

//     try {
//       console.log("File selected:", file);
//       const parsedData = await parseGedcomFile(file);
//       console.log("Parsed data:", parsedData);
//       onDataLoaded(parsedData);
//       setError(null);
//     } catch (err) {
//       console.error("Error in GEDCOM parsing:", err.message);
//       setError("Failed to parse GEDCOM file. Please check the format and try again.");
//     }
//   };

//   return (
//     <div className="file-uploader">
//       <input
//         type="file"
//         accept=".ged"
//         aria-label="file"
//         onChange={handleFileUpload}
//         className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
//       />
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };

// export default GedcomUploader;