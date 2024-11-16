import React from "react";
import Tree from "react-d3-tree";

// Function to transform the parsed GEDCOM data into the hierarchical format required by react-d3-tree
const transformToTree = (individuals) => {
  if (!individuals || individuals.length === 0) {
    return null; // Return null if no individuals
  }

  const individualMap = individuals.reduce((acc, ind) => {
    acc[ind.id] = {
      name: ind.names[0]?.fname + " " + ind.names[0]?.lname || "Unknown",
      attributes: {
        gender: ind.gender || "Unknown",
        birth: ind.births[0]?.date || "Unknown Birth Date",
        place: ind.births[0]?.place?.name || "Unknown Place",
      },
      children: [],
    };
    return acc;
  }, {});

  individuals.forEach((ind) => {
    if (ind.parents && ind.parents.length > 0) {
      ind.parents.forEach((parent) => {
        if (individualMap[parent.id]) {
          individualMap[parent.id].children.push(individualMap[ind.id]);
        }
      });
    }
  });

  const root = individuals.find((ind) => !ind.parents || ind.parents.length === 0);
  return root ? individualMap[root.id] : individualMap[individuals[0].id];
};

// FamilyTree component
const FamilyTree = ({ treeData }) => {
  if (!treeData || !treeData.individuals || treeData.individuals.length === 0) {
    return <p className="text-center text-gray-500">No family tree data available.</p>;
  }

  const formattedTreeData = transformToTree(treeData.individuals);

  if (!formattedTreeData) {
    return <p className="text-center text-gray-500">Could not generate a family tree.</p>;
  }

  if (!formattedTreeData.children || formattedTreeData.children.length === 0) {
    return (
      <div id="treeWrapper" style={{ width: "100%", height: "500px" }}>
        <Tree
          data={formattedTreeData}
          orientation="vertical"
          pathFunc="elbow"
          collapsible
          translate={{ x: 300, y: 50 }}
          nodeSize={{ x: 200, y: 200 }}
          styles={{
            nodes: {
              node: { circle: { fill: "lightblue" } },
              leafNode: { circle: { fill: "lightgreen" } },
            },
          }}
        />
        <p className="text-center text-gray-500 mt-4">
          This person has no recorded family relationships.
        </p>
      </div>
    );
  }

  return (
    <div id="treeWrapper" style={{ width: "100%", height: "500px" }}>
      <Tree
        data={formattedTreeData}
        orientation="vertical"
        pathFunc="elbow"
        collapsible
        translate={{ x: 300, y: 50 }}
        nodeSize={{ x: 200, y: 200 }}
        styles={{
          nodes: {
            node: { circle: { fill: "lightblue" } },
            leafNode: { circle: { fill: "lightgreen" } },
          },
        }}
      />
    </div>
  );
};

export default FamilyTree;


// import React from "react";
// import Tree from "react-d3-tree";

// // Function to transform the parsed GEDCOM data into a hierarchical structure
// const transformToTree = (individuals) => {
//   if (!individuals || individuals.length === 0) {
//     return null; // Return null if no individuals
//   }

//   // Step 1: Map individuals by ID
//   const individualMap = individuals.reduce((acc, ind) => {
//     acc[ind.id] = {
//       name: ind.names[0]?.fname + " " + ind.names[0]?.lname || "Unknown",
//       attributes: {
//         gender: ind.gender || "Unknown",
//         birth: ind.births[0]?.date || "Unknown Birth Date",
//         place: ind.births[0]?.place?.name || "Unknown Place",
//       },
//       children: [],
//     };
//     return acc;
//   }, {});

//   // Step 2: Handle families (shared spouse nodes)
//   const families = {}; // Map for family nodes
//   individuals.forEach((ind) => {
//     if (ind.weddings) {
//       ind.weddings.forEach((wedding) => {
//         if (!families[wedding.id]) {
//           families[wedding.id] = {
//             name: `${ind.names[0]?.fname || "Unknown"} & ${
//               wedding.spouse?.fname || "Unknown"
//             }`,
//             attributes: {
//               marriageDate: wedding.date || "Unknown Marriage Date",
//             },
//             children: [],
//           };
//         }

//         // Add children to the family node
//         if (wedding.children) {
//           wedding.children.forEach((child) => {
//             if (individualMap[child.id]) {
//               families[wedding.id].children.push(individualMap[child.id]);
//             }
//           });
//         }
//       });
//     }
//   });

//   // Step 3: Link parents and children
//   individuals.forEach((ind) => {
//     if (ind.parents) {
//       ind.parents.forEach((parent) => {
//         if (individualMap[parent.id]) {
//           individualMap[parent.id].children.push(individualMap[ind.id]);
//         }
//       });
//     }
//   });

//   // Step 4: Find the root node
//   const root = individuals.find((ind) => !ind.parents || ind.parents.length === 0);
//   if (root?.weddings?.length > 0) {
//     return families[root.weddings[0].id]; // Return the family node as the root
//   }

//   return root ? individualMap[root.id] : null; // Fallback to individual root node
// };

// // FamilyTree Component
// const FamilyTree = ({ treeData }) => {
//   if (!treeData || !treeData.individuals || treeData.individuals.length === 0) {
//     return <p className="text-center text-gray-500">No family tree data available.</p>;
//   }

//   // Transform the tree data into a hierarchical structure
//   const formattedTreeData = transformToTree(treeData.individuals);

//   if (!formattedTreeData) {
//     return <p className="text-center text-gray-500">Could not generate a family tree.</p>;
//   }

//   return (
//     <div id="treeWrapper" style={{ width: "100%", height: "500px" }}>
//       <Tree
//         data={formattedTreeData}
//         orientation="vertical"
//         pathFunc="elbow"
//         collapsible
//         translate={{ x: 300, y: 50 }}
//         nodeSize={{ x: 200, y: 200 }}
//         styles={{
//           nodes: {
//             node: { circle: { fill: "lightblue" } },
//             leafNode: { circle: { fill: "lightgreen" } },
//           },
//         }}
//       />
//     </div>
//   );
// };

// export default FamilyTree;
