import React from "react";
import { useNavigate } from "react-router-dom";
import GedcomUploader from "./gedcomUploader";

const GEDCOMPage = ({ gedcomData, onDataLoaded }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
        GEDCOM Family Tree Viewer
      </h1>
      <p style={{ fontSize: "16px", marginBottom: "30px", color: "#666" }}>
        Upload a GEDCOM file to visualize your family tree.
      </p>
      <GedcomUploader onDataLoaded={onDataLoaded} />
      {/* {gedcomData && (
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
      )} */}
    </div>
  );
};

export default GEDCOMPage;

