import React, { useMemo } from "react";
import { Tree } from "react-d3-tree";

const FamilyTreeDiagram = ({ gedcomData }) => {
    // Always call useMemo to optimize performance
    const treeData = useMemo(() => {
      if (!gedcomData || !gedcomData.individuals || !gedcomData.families) {
        return null; // Return null if data is invalid
      }
  
      // Helper function to recursively build tree nodes
      const buildTree = (individualId) => {
        const individual = gedcomData.individuals[individualId];
        if (!individual) return null;
  
        const name = individual.data?.NAME || "Unknown";
        const birthYear = individual.data?.DATE || "Unknown";
        const place = individual.data?.PLAC || "Unknown";
  
        // Recursively build children
        const children =
          individual.relationships?.children?.map(buildTree) || [];
  
        // Return node structure
        return {
          name,
          attributes: {
            Birth: birthYear,
            Place: place,
          },
          children,
        };
      };
  
      // Build the tree for each family
      return {
        name: "Root",
        children: Object.values(gedcomData.families).map((family) => {
          const husbandNode = family.relationships.husband
            ? buildTree(family.relationships.husband)
            : null;
  
          const wifeNode = family.relationships.wife
            ? buildTree(family.relationships.wife)
            : null;
  
          // Combine husband, wife, and children into a family node
          return {
            name: "Family",
            children: [
              husbandNode,
              wifeNode,
              ...(family.relationships.children || []).map(buildTree),
            ].filter(Boolean),
          };
        }),
      };
    }, [gedcomData]);
  
    // Handle invalid or empty data
    if (!treeData || !treeData.children?.length) {
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
