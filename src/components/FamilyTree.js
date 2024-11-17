import React from "react";

const FamilyTree = ({ gedcomData }) => {
  if (!gedcomData || !gedcomData.individuals) {
    console.warn("No GEDCOM data received");
    return <p>No tree data available</p>;
  }

  console.log("Received GEDCOM data in FamilyTree:", gedcomData);

  const renderIndividual = (individual) => {
    // Format the name to remove "/"
    const name = individual.names.join(" ").replace(/\//g, "");
    const birth = individual.births?.[0]?.date || "Unknown";
    const death = individual.deaths?.[0]?.date || "Unknown";

    console.log(`Rendering individual: ${name}, Birth: ${birth}, Death: ${death}`);

    return (
      <div key={individual.id} className="individual mb-4">
        <h3 className="font-bold">{name}</h3>
        <p>Birth: {birth}</p>
        <p>Death: {death}</p>
      </div>
    );
  };

  console.log("Rendering family tree...");
  return (
    <div className="family-tree">
      <h2 className="text-lg font-bold">Family Tree</h2>
      {gedcomData.individuals.map(renderIndividual)}
    </div>
  );
};

export default FamilyTree;



