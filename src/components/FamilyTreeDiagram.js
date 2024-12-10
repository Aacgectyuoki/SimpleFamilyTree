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

// Helper to calculate layout
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: "TB" });

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

const FamilyTreeDiagram = ({ gedcomData }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
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
            label: individual.data.NAME?.replace(/\//g, "") || "Unknown", // Remove slashes
          },
          style: {
            width: nodeWidth,
            height: nodeHeight,
            backgroundColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            color: "black",
          },
          position: { x: 0, y: 0 }, // Default position; layouted later
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
              source: individual.relationships.mother,
              target: id,
            });
          }
          return connections;
        });

      const layoutedData = getLayoutedElements(nodes, edges);
      setData(layoutedData);
    }
  }, [gedcomData]);

  const highlightRelatedNodes = (nodeId) => {
    const currentIndividual = gedcomData.individuals[nodeId];

    const relatedNodes = new Set();
    relatedNodes.add(nodeId);

    // Add parents
    if (currentIndividual?.relationships?.father) {
      relatedNodes.add(currentIndividual.relationships.father);
    }
    if (currentIndividual?.relationships?.mother) {
      relatedNodes.add(currentIndividual.relationships.mother);
    }

    // Add children
    if (currentIndividual?.relationships?.children) {
      currentIndividual.relationships.children.forEach((childId) => {
        relatedNodes.add(childId);
      });
    }

    // Add spouse if available
    if (currentIndividual?.relationships?.spouse) {
      relatedNodes.add(currentIndividual.relationships.spouse);
    }

    setData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: relatedNodes.has(n.id) ? 1 : 0.3, // Dim unrelated nodes
          border: relatedNodes.has(n.id) ? "2px solid black" : "none", // Highlight related nodes
        },
      }));

      const updatedEdges = prevData.edges.map((edge) => ({
        ...edge,
        style: {
          stroke: relatedNodes.has(edge.source) && relatedNodes.has(edge.target) ? "#000" : "#ccc", // Highlight related edges
          strokeWidth: relatedNodes.has(edge.source) && relatedNodes.has(edge.target) ? 2 : 1,
        },
      }));

      return { nodes: updatedNodes, edges: updatedEdges };
    });
  };

  const handleSearch = () => {
    const targetNode = data.nodes.find((node) =>
      node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (targetNode && reactFlowInstance.current) {
      const { x, y } = targetNode.position;
      reactFlowInstance.current.setCenter(
        x + nodeWidth / 2, // Center horizontally
        y + nodeHeight / 2, // Center vertically
        {
          zoom: 1.5, // Optional: Adjust zoom level
        }
      );
      highlightRelatedNodes(targetNode.id); // Highlight the searched person and related nodes
    } else {
      alert("Person not found.");
    }
  };

  const handleNodeClick = (event, node) => {
    console.log("Node clicked:", node);
    highlightRelatedNodes(node.id);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handlePaneClick = () => {
    setData((prevData) => ({
      nodes: prevData.nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1, // Reset all nodes to fully visible
          border: "none", // Remove border highlights
        },
      })),
      edges: prevData.edges.map((e) => ({
        ...e,
        style: {
          stroke: "#ccc", // Reset all edges to default stroke
          strokeWidth: 1, // Default stroke width
        },
      })),
    }));
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <div style={{ padding: "10px", backgroundColor: "#f8f9fa", zIndex: 10 }}>
          <input
            type="text"
            placeholder="Search for a person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
              width: "250px",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
        <ReactFlow
          nodes={data.nodes}
          edges={data.edges}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onInit={(instance) => (reactFlowInstance.current = instance)}
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

export default FamilyTreeDiagram;
