import React, { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import dagre from "dagre";
import "../styles/FamilyTree.css";
import "react-flow-renderer/dist/style.css";
import translations from "../translations";
import translateText from "../utils/translate";


// LibreTranslate API function
// const translateText = async (text, source = "en", target = "ar") => {
//   try {
//     const response = await axios.post("https://libretranslate.com/translate", {
//       q: text,
//       source: source,
//       target: target,
//       format: "text",
//     });
//     return response.data.translatedText;
//   } catch (error) {
//     console.error("Translation Error:", error);
//     return text; // Fallback to original text
//   }
// };

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

const FamilyTreeDiagram = ({ gedcomData, language }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const reactFlowInstance = useRef(null);

  const t = (key) => translations[language]?.[key] || key;

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
        const isAlive = !individual.data.DEAT;
        const gender = individual.data.SEX;
  
        let backgroundColor = "#e0f7ff"; // Default: alive males
        if (!isAlive) backgroundColor = "#a4d8f0";
        if (gender === "F") backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8";
  
        const name =
          language === "ar"
            ? individual.data.NAME_ARABIC || individual.data.NAME?.replace(/\//g, "") || "Unknown"
            : individual.data.NAME?.replace(/\//g, "") || "Unknown";
  
        return {
          id,
          data: { label: name },
          style: {
            width: nodeWidth,
            height: nodeHeight,
            backgroundColor,
            fontSize: "16px",
          },
          position: { x: 0, y: 0 },
        };
      });
  
      const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
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
  
  // Add the missing `data.nodes` dependency
  useEffect(() => {
    const translateNodeLabels = async () => {
      const translatedNodes = await Promise.all(
        data.nodes.map(async (node) => {
          const translatedLabel = await translateText(node.data.label, "en", language);
          return { ...node, data: { ...node.data, label: translatedLabel } };
        })
      );
      setData((prevData) => ({ ...prevData, nodes: translatedNodes }));
    };
  
    if (language === "ar" && data.nodes.length > 0) {
      translateNodeLabels();
    }
  }, [language, data.nodes]);
  

  useEffect(() => {
    const translateNodeLabels = async () => {
      const translatedNodes = await Promise.all(
        data.nodes.map(async (node) => {
          const translatedLabel = await translateText(node.data.label, "en", language);
          return { ...node, data: { ...node.data, label: translatedLabel } };
        })
      );
      setData((prevData) => ({ ...prevData, nodes: translatedNodes }));
    };
  
    if (language === "ar") {
      translateNodeLabels();
    }
  }, [language]);

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
              placeholder={translations[language].searchPlaceholder || "Search for a person..."}
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
              <h2>{t("personDetails")}</h2>
              <p>
                <strong>{t("firstName")}:</strong>{" "}
                {selectedPerson.data?.NAME?.split(" ")[0] || t("unknown")}
              </p>
              <p>
                <strong>{t("lastName")}:</strong>{" "}
                {selectedPerson.data?.NAME?.split(" ")[1] || t("unknown")}
              </p>
              <p>
                <strong>{t("dateOfBirth")}:</strong>{" "}
                {selectedPerson.data?.BIRT?.DATE || t("unknown")}
              </p>
              <p>
                <strong>{t("alive")}:</strong>{" "}
                {selectedPerson.data?.DEAT ? t("no") : t("yes")}
              </p>
              {selectedPerson.data?.DEAT && (
                <p>
                  <strong>{t("dateOfDeath")}:</strong>{" "}
                  {selectedPerson.data?.DEAT?.DATE || t("unknown")}
                </p>
              )}
              <p>
                <strong>{t("father")}:</strong>{" "}
                {gedcomData.individuals[selectedPerson.relationships?.father]?.data?.NAME || t("unknown")}
              </p>
              <p>
                <strong>{t("mother")}:</strong>{" "}
                {gedcomData.individuals[selectedPerson.relationships?.mother]?.data?.NAME || t("unknown")}
              </p>
              <p>
                <strong>{t("children")}:</strong>{" "}
                {selectedPerson.relationships?.children
                  ?.map(
                    (childId) =>
                      gedcomData.individuals[childId]?.data?.NAME || t("unknown")
                  )
                  .join(", ") || t("none")}
              </p>
            </div>
          ) : (
            <h2>{t("selectPerson")}</h2>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDiagram;
