import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleFileUpload } from "../services/gedcomParser";

// Helper function to clean up names
const cleanName = (name) => name.replace(/[\/]/g, "").trim();

// Function to reconcile family data and fix relationships
const reconcileFamilyData = (parsedData) => {
  const { individuals, families } = parsedData;

  for (const familyId1 in families) {
    const family1 = families[familyId1];

    for (const familyId2 in families) {
      if (familyId1 === familyId2) continue;

      const family2 = families[familyId2];

      const commonChild = family1.relationships.children.find((childId) =>
        family2.relationships.children.includes(childId)
      );

      if (commonChild) {
        console.log("Combining families with common child:", family1, family2);

        if (family1.relationships.husband && family2.relationships.wife) {
          family1.relationships.wife = family2.relationships.wife;
          individuals[family2.relationships.wife].relationships.spouse =
            family1.relationships.husband;
          individuals[family1.relationships.husband].relationships.spouse =
            family2.relationships.wife;

          const child = individuals[commonChild];
          child.relationships.father = family1.relationships.husband;
          child.relationships.mother = family2.relationships.wife;

          delete families[familyId2];
        } else if (family2.relationships.husband && family1.relationships.wife) {
          family2.relationships.wife = family1.relationships.wife;
          individuals[family1.relationships.wife].relationships.spouse =
            family2.relationships.husband;
          individuals[family2.relationships.husband].relationships.spouse =
            family1.relationships.wife;

          const child = individuals[commonChild];
          child.relationships.father = family2.relationships.husband;
          child.relationships.mother = family1.relationships.wife;

          delete families[familyId1];
        }

        console.log("Updated family:", family1);
        console.log("Removed redundant family:", familyId2);
      }
    }
  }

  return parsedData;
};

const GedcomUploader = ({ onDataLoaded }) => {
  const navigate = useNavigate();
  const [gedcomData, setGedcomData] = useState(null);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const parsedData = await handleFileUpload(file);
      const reconciledData = reconcileFamilyData(parsedData);
      setGedcomData(reconciledData);
      if (onDataLoaded) onDataLoaded(reconciledData);
    } catch (error) {
      console.error("Failed to parse GEDCOM file:", error);
    }
  };

  const renderIndividual = (individual, allIndividuals) => {
    const { id, data, relationships } = individual;

    const children = relationships?.children?.map(
      (childId) => cleanName(allIndividuals[childId]?.data.NAME || "Unknown")
    );

    const spouse = relationships?.spouse
      ? cleanName(allIndividuals[relationships.spouse]?.data.NAME || "None")
      : "None";

    const father = relationships?.father
      ? cleanName(allIndividuals[relationships.father]?.data.NAME || "Unknown")
      : "Unknown";

    const mother = relationships?.mother
      ? cleanName(allIndividuals[relationships.mother]?.data.NAME || "Unknown")
      : "Unknown";

    // Determine if Alive or Dead
    const isAlive = !data.DEAT;

    return (
      <div
        key={id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "15px",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
          textAlign: "left",
        }}
      >
        <h3 style={{ margin: "0 0 10px", color: "#333" }}>
          {cleanName(data.NAME || "Unknown")}
        </h3>
        <p>
          <strong>Gender:</strong> {data.SEX || "Unknown"}
        </p>
        {/* <p>
          <strong>Birth Date:</strong> {data.BIRT || "Unknown"}
        </p> */}
        <p>
          <strong>Birth Date:</strong> {data.DATE || "Unknown"}
        </p>
        <p>
          <strong>Status:</strong> {isAlive ? "Alive" : "Dead"}
        </p>
        <p>
          <strong>Father:</strong> {father}
        </p>
        <p>
          <strong>Mother:</strong> {mother}
        </p>
        <p>
          <strong>Spouse:</strong> {spouse}
        </p>
        <p>
          <strong>Children:</strong>{" "}
          {children?.length ? children.join(", ") : "None"}
        </p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <label
        htmlFor="gedcom-file"
        style={{
          display: "block",
          marginBottom: "15px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#555",
        }}
      >
        Upload GEDCOM File
      </label>
      <input
        type="file"
        id="gedcom-file"
        accept=".ged"
        onChange={onFileChange}
        style={{
          display: "block",
          margin: "0 auto 20px",
          padding: "8px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          fontSize: "14px",
          width: "100%",
          maxWidth: "400px",
          background: "#f8f8f8",
        }}
      />
      {gedcomData && (
        <div>
          <button
            onClick={() => navigate("/diagram")}
            style={{
              marginTop: "30px",
              padding: "12px 25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            View Family Tree
          </button>
          <h2 style={{ fontSize: "22px", margin: "20px 0", color: "#007bff" }}>
            Parsed GEDCOM Data
          </h2>
          {Object.values(gedcomData.individuals).map((individual) =>
            renderIndividual(individual, gedcomData.individuals)
          )}
        </div>
      )}
    </div>
  );
};

export default GedcomUploader;
