import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import "../styles/FamilyTree.css"; // Ensure this file exists for styling

const initialData = {
  nodes: [
    {
      id: "1",
      data: {
        label: (
          <div className="node-box">
            <h3>Doris Dell</h3>
            <p>Born: 1959</p>
            <p>Place: Frankfurt am Main, Germany</p>
          </div>
        ),
        type: "mother",
      },
      position: { x: 150, y: 50 },
      visible: true,
    },
    {
      id: "2",
      data: {
        label: (
          <div className="node-box">
            <h3>Michael Thibodeau</h3>
            <p>Born: 1965</p>
            <p>Place: San Francisco, USA</p>
          </div>
        ),
        type: "father",
      },
      position: { x: 450, y: 50 },
      visible: true,
    },
    {
      id: "3",
      data: {
        label: (
          <div className="node-box">
            <h3>Max Dell-Thibodeau</h3>
            <p>Born: 1996</p>
            <p>Place: New York City, USA</p>
          </div>
        ),
        type: "child",
      },
      position: { x: 300, y: 200 },
      visible: true,
    },
  ],
  edges: [
    { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
    { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
  ],
};

const FamilyTree = () => {
  const [data, setData] = useState(initialData);

  const handleNodeClick = (event, node) => {
    console.log("Node clicked:", node);

    setData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) => {
        // Show relationships based on type
        if (node.id === "3") {
          // Child clicked - Show parents
          if (n.id === "1" || n.id === "2") n.visible = true;
        } else if (node.id === "1") {
          // Mother clicked - Show her parents and children
          if (n.id === "3") n.visible = true;
          if (n.id === "2") n.visible = false; // Hide spouse
        } else if (node.id === "2") {
          // Father clicked - Show his parents and children
          if (n.id === "3") n.visible = true;
          if (n.id === "1") n.visible = false; // Hide spouse
        }
        return n;
      });

      return { ...prevData, nodes: updatedNodes };
    });
  };

  const visibleNodes = data.nodes.filter((node) => node.visible);
  const visibleEdges = data.edges.filter(
    (edge) =>
      visibleNodes.find((node) => node.id === edge.source) &&
      visibleNodes.find((node) => node.id === edge.target)
  );

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodeClick={handleNodeClick}
          fitView
          style={{ background: "#f8f9fa" }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTree;




// import React from "react";

// const FamilyTree = ({ gedcomData }) => {
//   if (!gedcomData || !gedcomData.individuals) return <p>No family data available</p>;

//   const findIndividual = (id) =>
//     gedcomData.individuals.find((individual) => individual.id === id);

//   const renderIndividual = (individual) => {
//     const name = individual.names.join(" ");
//     const birth = individual.births?.[0]?.date || "Unknown";
//     const death = individual.deaths?.[0]?.date || "Unknown";

//     const family = gedcomData.families.find((fam) =>
//       fam.children.includes(individual.id)
//     );

//     const spouse = family
//       ? findIndividual(family.husband === individual.id ? family.wife : family.husband)
//       : null;

//     const children = family
//       ? family.children
//           .filter((childId) => childId !== individual.id)
//           .map((childId) => findIndividual(childId))
//       : [];

//     return (
//       <div key={individual.id} className="individual mb-4">
//         <h3 className="font-bold">{name}</h3>
//         <p>Birth: {birth}</p>
//         <p>Death: {death}</p>
//         {spouse && <p>Spouse: {spouse.names.join(" ")}</p>}
//         {children.length > 0 && (
//           <div>
//             <p>Children:</p>
//             <ul>
//               {children.map((child) => (
//                 <li key={child.id}>{child.names.join(" ")}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="family-tree">
//       <h2 className="text-lg font-bold">Family Tree</h2>
//       {gedcomData.individuals.map(renderIndividual)}
//     </div>
//   );
// };

// export default FamilyTree;
