import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleFileUpload } from "../services/gedcomParser";

const GedcomUploader = () => {
  const navigate = useNavigate();
  const [gedcomData, setGedcomData] = useState(null);

  // Clean GEDCOM data (remove extra slashes, format names)
  const cleanGedcomData = (data) => {
    const cleanedIndividuals = Object.entries(data.individuals).reduce(
      (acc, [id, individual]) => {
        acc[id] = {
          ...individual,
          data: {
            ...individual.data,
            NAME: individual.data.NAME?.replace(/\//g, "") || "Unknown",
          },
        };
        return acc;
      },
      {}
    );

    return {
      ...data,
      individuals: cleanedIndividuals,
    };
  };

  // Handle file change
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const parsedData = await handleFileUpload(file);
      const cleanedData = cleanGedcomData(parsedData);
      setGedcomData(cleanedData);
      console.log("Cleaned GEDCOM Data:", cleanedData);
    } catch (error) {
      console.error("Failed to parse GEDCOM file:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>Upload GEDCOM File</h2>
      <input
        type="file"
        accept=".ged"
        onChange={onFileChange}
        style={{ marginBottom: "20px" }}
      />
      <button
        onClick={() => navigate("/diagram", { state: { gedcomData } })}
        style={{
          marginTop: "20px",
          padding: "12px 25px",
          cursor: gedcomData ? "pointer" : "not-allowed",
        }}
        disabled={!gedcomData}
      >
        View Family Tree
      </button>
    </div>
  );
};

export default GedcomUploader;
