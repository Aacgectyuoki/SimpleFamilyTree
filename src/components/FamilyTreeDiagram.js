import React, { useMemo } from "react";
import { Tree } from "react-d3-tree";

const FamilyTreeDiagram = ({ gedcomData }) => {
  // Always call useMemo
  const treeData = useMemo(() => {
    if (!gedcomData || !gedcomData.individuals || !gedcomData.families) {
      return null; // Return null if data is invalid
    }

    const buildTree = (individualId) => {
      const individual = gedcomData.individuals[individualId];
      if (!individual) return null;

      const name = individual.data?.NAME || "Unknown";
      const birthYear = individual.data?.BIRT || "Unknown";
      const deathYear = individual.data?.DEAT || "Unknown";

      const children =
        individual.relationships?.children?.map(buildTree) || [];

      return {
        name,
        attributes: {
          Birth: birthYear,
          Death: deathYear,
        },
        children,
      };
    };

    const rootFamilies = Object.values(gedcomData.families).filter(
      (family) => !family.relationships.husband && !family.relationships.wife
    );

    return {
      name: "Root",
      children: rootFamilies.map((family) => {
        const husbandNode = family.relationships.husband
          ? buildTree(family.relationships.husband)
          : null;
        const wifeNode = family.relationships.wife
          ? buildTree(family.relationships.wife)
          : null;

        return {
          name: "Family",
          children: [husbandNode, wifeNode].filter(Boolean),
        };
      }),
    };
  }, [gedcomData]);

  // Handle invalid data in the JSX
  if (!treeData) {
    return <p>No family data available.</p>;
  }

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 300, y: 50 }}
        nodeSize={{ x: 200, y: 150 }}
        pathFunc="elbow"
      />
    </div>
  );
};

export default FamilyTreeDiagram;
