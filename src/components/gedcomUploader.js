// gedcomUploader.js
import React, { useState } from "react";
import { handleFileUpload } from "../services/gedcomParser";

// Helper function to clean up names
const cleanName = (name) => {
  return name.replace(/[\/\\]/g, "").trim();
};

const GedcomUploader = () => {
  const [gedcomData, setGedcomData] = useState(null);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const parsedData = await handleFileUpload(file);
      setGedcomData(parsedData);
    } catch (error) {
      console.error("Failed to parse GEDCOM file:", error);
    }
  };

  const renderIndividual = (individual, allIndividuals) => {
    const { id, data, relationships } = individual;

    const children = relationships?.children?.map(
      (childId) => cleanName(allIndividuals[childId]?.data.NAME || "Unknown")
    );

    const spouse =
      cleanName(allIndividuals[relationships?.spouse]?.data.NAME || "None");

    const father =
      cleanName(allIndividuals[relationships?.father]?.data.NAME || "Unknown");

    const mother =
      cleanName(allIndividuals[relationships?.mother]?.data.NAME || "Unknown");

    return (
      <div key={id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        <h3>{cleanName(data.NAME)}</h3>
        <p><strong>Gender:</strong> {data.SEX || "Unknown"}</p>
        <p><strong>Birth Date:</strong> {data.BIRT || "Unknown"}</p>
        <p><strong>Father:</strong> {father}</p>
        <p><strong>Mother:</strong> {mother}</p>
        <p><strong>Spouse:</strong> {spouse}</p>
        <p>
          <strong>Children:</strong>{" "}
          {children?.length ? children.join(", ") : "None"}
        </p>
      </div>
    );
  };

  return (
    <div>
      <h1>GEDCOM Family Tree Viewer</h1>
      <input type="file" accept=".ged" onChange={onFileChange} />
      {gedcomData && (
        <div>
          <h2>Individuals</h2>
          {Object.values(gedcomData.individuals).map((individual) =>
            renderIndividual(individual, gedcomData.individuals)
          )}
        </div>
      )}
    </div>
  );
};

export default GedcomUploader;
