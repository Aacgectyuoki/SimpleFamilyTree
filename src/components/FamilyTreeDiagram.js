import React, { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import dagre from "dagre";
import "../styles/FamilyTree.css";
import "react-flow-renderer/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

// Helper function to calculate layout
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: "TB", marginx: 20, marginy: 20 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = "top";
    node.sourcePosition = "bottom";
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

// Helper to determine node styles
const getNodeStyle = (individual) => {
  const isAlive = !individual.data.DEAT;
  const gender = individual.data.SEX;

  let backgroundColor = "#e0f7ff"; // Default: light blue for alive males
  if (!isAlive) {
    backgroundColor = "#a4d8f0"; // Darker blue for deceased males
  }
  if (gender === "F") {
    backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8"; // Light magenta for females
  }

  return {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    border: "1px solid #ddd",
    borderRadius: "8px",
  };
};

const FamilyTreeDiagram = ({ gedcomData }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
        const birthDate = individual.data.BIRT?.DATE || "Date not available"; // Safely access birth date
        const birthPlace = individual.data.BIRT?.PLAC || "Place not available"; // Safely access birth place
        const isAlive = !individual.data.DEAT; // Determine if the person is alive
        const gender = individual.data.SEX; // Get gender
  
        // Define colors based on gender and life status
        let backgroundColor = "#e0f7ff"; // Default: very light blue for alive males
        if (!isAlive) {
          backgroundColor = "#a4d8f0"; // Light blue for deceased males
        }
        if (gender === "F") {
          backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8"; // Very light magenta for alive females, light magenta for deceased
        }
  
        return {
          id,
          data: {
            label: (
              <div className="node-box">
                <h3>{individual.data.NAME?.replace(/\//g, "") || "Unknown"}</h3> {/* Remove slashes */}
                <p>Born: {birthDate}</p> {/* Display the birth date */}
                <p>Place: {birthPlace}</p> {/* Display the birth place */}
              </div>
            ),
          },
          style: {
            width: nodeWidth,
            height: nodeHeight,
            backgroundColor,
            border:
              birthDate === "Date not available" || birthPlace === "Place not available"
                ? "2px solid red" // Highlight nodes with missing data
                : "1px solid #ddd",
            borderRadius: "8px",
          },
        };
      });
  
      const edges = Object.entries(gedcomData.individuals)
        .flatMap(([id, individual]) => {
          const connections = [];
          if (individual.relationships?.father) {
            connections.push({
              id: `${individual.relationships.father}-${id}`,
              source: individual.relationships.father,
              target: id,
            });
          }
          if (individual.relationships?.mother) {
            connections.push({
              id: `${individual.relationships.mother}-${id}`,
              source: id,
            });
          }
          return connections;
        });
  
      const layoutedData = getLayoutedElements(nodes, edges);
      setData(layoutedData);
    }
  }, [gedcomData]);

  const handleNodeClick = (event, node) => {
    if (!reactFlowInstance.current) return;

    console.log("Node clicked:", node);

    const nodePosition = node.position;
    reactFlowInstance.current.setCenter(
      nodePosition.x + nodeWidth / 2,
      nodePosition.y + nodeHeight / 2,
      { zoom: 1.5 }
    );

    // Filter nodes and edges related to the clicked node
    setData((prevData) => {
      const relatedNodes = new Set([node.id]);

      // Add parents and children
      prevData.edges.forEach((edge) => {
        if (edge.target === node.id) relatedNodes.add(edge.source); // Parents
        if (edge.source === node.id) relatedNodes.add(edge.target); // Children
      });

      // Add spouse
      const spouseId = gedcomData.individuals[node.id]?.relationships?.spouse;
      if (spouseId) {
        relatedNodes.add(spouseId);
      }

      // Update nodes
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        hidden: !relatedNodes.has(n.id),
      }));

      // Update edges
      const updatedEdges = prevData.edges.filter(
        (edge) =>
          relatedNodes.has(edge.source) && relatedNodes.has(edge.target)
      );

      return { nodes: updatedNodes, edges: updatedEdges };
    });
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={data.nodes}
          edges={data.edges}
          onNodeClick={handleNodeClick}
          onInit={(instance) => (reactFlowInstance.current = instance)}
          fitView
          style={{ background: "#f8f9fa" }}
        >
          <Background gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDiagram;