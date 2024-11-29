import React from "react";
import { useNavigate } from "react-router-dom";
import GedcomUploader from "./gedcomUploader";

const GEDCOMPage = ({ gedcomData, onDataLoaded }) => {
  const navigate = useNavigate();

  return (
    <div>
      <GedcomUploader onDataLoaded={onDataLoaded} />
      {/* Conditionally render the button once data is available */}
      {gedcomData && (
        <button
          onClick={() => navigate("/diagram")}
          className="btn btn-primary mt-4"
        >
          View Family Tree
        </button>
      )}
    </div>
  );
};

export default GEDCOMPage;
