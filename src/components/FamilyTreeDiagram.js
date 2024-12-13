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
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState("en");
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
        const isAlive = !individual.data.DEAT;
        const gender = individual.data.SEX;

        let backgroundColor = "#e0f7ff"; // Default: very light blue for alive males
        if (!isAlive) backgroundColor = "#a4d8f0";
        if (gender === "F") backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8";

        const name = language === 'ar' 
          ? individual.data.NAME_ARABIC || individual.data.NAME 
          : individual.data.NAME?.replace(/\//g, "") || "Unknown";


        return {
          id,
          data: {
            label: name,
            // label: individual.data.NAME?.replace(/\//g, "") || "Unknown",
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
          position: { x: 0, y: 0 },
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
  }, [gedcomData, language]);

  const handleLanguageToggle = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "ar" : "en"));
  };

  const highlightRelatedNodes = (nodeId) => {
    const currentIndividual = gedcomData.individuals[nodeId];

    // setSelectedPerson(currentIndividual);

    const relatedNodes = new Set();
    relatedNodes.add(nodeId);

    if (currentIndividual?.relationships?.father) relatedNodes.add(currentIndividual.relationships.father);
    if (currentIndividual?.relationships?.mother) relatedNodes.add(currentIndividual.relationships.mother);
    if (currentIndividual?.relationships?.children) {
      currentIndividual.relationships.children.forEach((childId) => relatedNodes.add(childId));
    }
    if (currentIndividual?.relationships?.spouse) relatedNodes.add(currentIndividual.relationships.spouse);

    setData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: relatedNodes.has(n.id) ? 1 : 0.3,
          border: relatedNodes.has(n.id) ? "2px solid black" : "none",
        },
      }));

      const updatedEdges = prevData.edges.map((edge) => ({
        ...edge,
        style: {
          stroke: relatedNodes.has(edge.source) && relatedNodes.has(edge.target) ? "#000" : "#ccc",
          strokeWidth: relatedNodes.has(edge.source) && relatedNodes.has(edge.target) ? 2 : 1,
        },
      }));

      return { nodes: updatedNodes, edges: updatedEdges };
    });
  };

  const handleSearch = (nodeId) => {
    const targetNode = data.nodes.find((node) => node.id === nodeId);

    if (targetNode && reactFlowInstance.current) {
      const { x, y } = targetNode.position;
      reactFlowInstance.current.setCenter(x + nodeWidth / 2, y + nodeHeight / 2, { zoom: 1.5 });
      highlightRelatedNodes(targetNode.id);
    } else {
      alert("Person not found.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const matches = data.nodes.filter((node) =>
        node.data.label.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (nodeId) => {
    handleSearch(nodeId);
    setSuggestions([]);
    setSearchTerm("");
  };

  const handleNodeClick = (event, node) => {
    const selectedIndividual = gedcomData.individuals[node.id]; // Retrieve the full individual object
    setSelectedPerson(selectedIndividual); // Set the full object, not just the ID
    highlightRelatedNodes(node.id); // Highlight the node and its relatives
  };
  

  const handlePaneClick = () => {
    setData((prevData) => ({
      nodes: prevData.nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1,
          border: "none",
        },
      })),
      edges: prevData.edges.map((e) => ({
        ...e,
        style: {
          stroke: "#ccc",
          strokeWidth: 1,
        },
      })),
    }));
    setSelectedPerson(null);
  };

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Family Tree Diagram */}
        <div style={{ flex: 3, position: "relative" }}>
          <div style={{ padding: "10px", position: "absolute", top: 0, left: 0, zIndex: 10 }}>
            <input
              type="text"
              placeholder="Search for a person..."
              value={searchTerm}
              onChange={handleInputChange}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginRight: "10px",
                width: "250px",
              }}
            />
            <div
              style={{
                position: "absolute",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: "250px",
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {suggestions.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleSuggestionClick(node.id)}
                  style={{ padding: "8px", cursor: "pointer" }}
                >
                  {node.data.label}
                </div>
              ))}
            </div>
          </div>
          <ReactFlow
            nodes={data.nodes}
            edges={data.edges}
            onInit={(instance) => (reactFlowInstance.current = instance)}
            onPaneClick={handlePaneClick}
            onNodeClick={handleNodeClick}
            fitView
            style={{ background: "#f8f9fa", height: "100%" }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div
  style={{
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: "20px",
    overflowY: "auto",
  }}
>
  {selectedPerson ? (
    <div>
      <h2>Person Details</h2>
      <p>
        <strong>First Name:</strong>{" "}
        {selectedPerson.data?.NAME?.split(" ")[0] || "Unknown"}
      </p>
      <p>
        <strong>Last Name:</strong>{" "}
        {selectedPerson.data?.NAME?.split(" ")[1] || "Unknown"}
      </p>
      <p>
        <strong>Date of Birth:</strong>{" "}
        {selectedPerson.data?.BIRT?.DATE || "Unknown"}
      </p>
      <p>
        <strong>Alive:</strong>{" "}
        {selectedPerson.data?.DEAT ? "No" : "Yes"}
      </p>
      {selectedPerson.data?.DEAT && (
        <p>
          <strong>Date of Death:</strong>{" "}
          {selectedPerson.data?.DEAT?.DATE || "Unknown"}
        </p>
      )}
      <p>
        <strong>Father:</strong>{" "}
        {gedcomData.individuals[selectedPerson.relationships?.father]?.data
          ?.NAME || "Unknown"}
      </p>
      <p>
        <strong>Mother:</strong>{" "}
        {gedcomData.individuals[selectedPerson.relationships?.mother]?.data
          ?.NAME || "Unknown"}
      </p>
      <p>
        <strong>Children:</strong>{" "}
        {selectedPerson.relationships?.children
          ?.map(
            (childId) =>
              gedcomData.individuals[childId]?.data?.NAME || "Unknown"
          )
          .join(", ") || "None"}
      </p>
    </div>
  ) : (
    <h2>Select a person to see details</h2>
  )}
</div>
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDiagram;
