import React from "react";

const FamilyTree = ({ gedcomData }) => {
  if (!gedcomData || !gedcomData.individuals) return <p>No family data available</p>;

  const findIndividual = (id) =>
    gedcomData.individuals.find((individual) => individual.id === id);

  const renderIndividual = (individual) => {
    const name = individual.names.join(" ");
    const birth = individual.births?.[0]?.date || "Unknown";
    const death = individual.deaths?.[0]?.date || "Unknown";

    const family = gedcomData.families.find((fam) =>
      fam.children.includes(individual.id)
    );

    const spouse = family
      ? findIndividual(family.husband === individual.id ? family.wife : family.husband)
      : null;

    const children = family
      ? family.children
          .filter((childId) => childId !== individual.id)
          .map((childId) => findIndividual(childId))
      : [];

    return (
      <div key={individual.id} className="individual mb-4">
        <h3 className="font-bold">{name}</h3>
        <p>Birth: {birth}</p>
        <p>Death: {death}</p>
        {spouse && <p>Spouse: {spouse.names.join(" ")}</p>}
        {children.length > 0 && (
          <div>
            <p>Children:</p>
            <ul>
              {children.map((child) => (
                <li key={child.id}>{child.names.join(" ")}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="family-tree">
      <h2 className="text-lg font-bold">Family Tree</h2>
      {gedcomData.individuals.map(renderIndividual)}
    </div>
  );
};

export default FamilyTree;
