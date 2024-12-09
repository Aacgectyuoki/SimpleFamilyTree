import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleFileUpload } from "../services/gedcomParser";

const GedcomUploader = ({ onDataLoaded }) => {
  const navigate = useNavigate();
  const [gedcomData, setGedcomData] = useState(null);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const parsedData = await handleFileUpload(file);
      setGedcomData(parsedData);
      if (onDataLoaded) onDataLoaded(parsedData);
    } catch (error) {
      console.error("Failed to parse GEDCOM file:", error);
    }
  };

  const renderIndividual = (individual, allIndividuals) => {
    const { id, data, relationships } = individual;
    const name = data.NAME || "Unknown";
    const birthDate = data.BIRT?.DATE || "Unknown";
    const birthPlace = data.BIRT?.PLAC || "Unknown";
    const deathDate = data.DEAT?.DATE || "Unknown";

    const father = relationships.father
      ? allIndividuals[relationships.father]?.data.NAME || "Unknown"
      : "Unknown";
    const mother = relationships.mother
      ? allIndividuals[relationships.mother]?.data.NAME || "Unknown"
      : "Unknown";

    return (
      <div key={id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
        <h3>{name}</h3>
        <p><strong>Born:</strong> {birthDate}</p>
        <p><strong>Birth Place:</strong> {birthPlace}</p>
        <p><strong>Died:</strong> {deathDate}</p>
        <p><strong>Father:</strong> {father}</p>
        <p><strong>Mother:</strong> {mother}</p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Upload GEDCOM File</h2>
      <input
        type="file"
        accept=".ged"
        onChange={onFileChange}
        style={{ marginBottom: "20px" }}
      />
      {gedcomData && (
        <div>
          <h2>Parsed GEDCOM Data</h2>
          {Object.values(gedcomData.individuals).map((individual) =>
            renderIndividual(individual, gedcomData.individuals)
          )}
        </div>
      )}
      <button
        onClick={() => navigate("/diagram")}
        style={{ marginTop: "30px", padding: "12px 25px" }}
      >
        View Family Tree
      </button>
    </div>
  );
};

export default GedcomUploader;
