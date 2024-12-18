import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import dagre from "dagre";
import { loadTranslations } from "../utils/loadTranslations";
import { textMap } from "../utils/textMap";
import { translateText } from "../utils/translateService";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = "top";
      node.sourcePosition = "bottom";
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
      return node;
    }),
    edges,
  };
};

const FamilyTreeDiagram = () => {
  const location = useLocation();
  const gedcomData = location.state?.gedcomData || null;
  const [translations, setTranslations] = useState(textMap.en);
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [language, setLanguage] = useState("en"); // Language toggle state
  const reactFlowInstance = useRef(null);

  const loadLanguage = async () => {
    const newTranslations = await loadTranslations(language === "en" ? "ar" : "en");
    setTranslations(newTranslations);
    setLanguage(language === "en" ? "ar" : "en");
  };

  useEffect(() => {
    if (gedcomData) {
      const processNodes = async () => {
        const nodes = await Promise.all(
          Object.entries(gedcomData.individuals).map(async ([id, individual]) => {

            const isAlive = !individual.data.DEAT;
            const gender = individual.data.SEX;

            // Gender and alive/dead based styles
            let backgroundColor = "#e0f7ff"; // Default: alive male
            if (!isAlive) backgroundColor = "#a4d8f0"; // Dead male
            if (gender === "F") backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8"; // Female styles

            // Full name with translations
            const fullName = `${individual.data.GIVN || "Unknown"} ${individual.data.SURN || ""}`.trim();
            const label = language === "ar" ? await translateText(fullName) : fullName;

            return {
              id,
              data: { label },
              style: {
                width: nodeWidth,
                height: nodeHeight,
                backgroundColor,
                // backgroundColor: "#e0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                color: "black",
              },
            };
          })
        );

        const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
          const connections = [];
          if (individual.relationships?.father) connections.push({ source: individual.relationships.father, target: id });
          if (individual.relationships?.mother) connections.push({ source: individual.relationships.mother, target: id });
          return connections;
        });

        const layoutedData = getLayoutedElements(nodes, edges);
        setData(layoutedData);
      };

      processNodes();
    }
  }, [gedcomData, language]);

  // useEffect(() => {
  //   if (gedcomData) {
  //     const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
  //       const isAlive = !individual.data.DEAT;
  //       const gender = individual.data.SEX;

  //       let backgroundColor = "#e0f7ff"; // Default: alive males
  //       if (!isAlive) backgroundColor = "#a4d8f0";
  //       if (gender === "F") backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8";

  //       // Translate names based on the selected language
  //       const firstName = individual.data.GIVN || "Unknown";
  //       const lastName = individual.data.SURN || "";
  //       const fullName = `${firstName} ${lastName}`.trim();

  //       return {
  //         id,
  //         data: { label: language === "ar" ? `ترجمة ${fullName}` : fullName },
  //         style: {
  //           width: nodeWidth,
  //           height: nodeHeight,
  //           backgroundColor,
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           fontSize: "14px",
  //           fontWeight: "bold",
  //         },
  //         position: { x: 0, y: 0 },
  //       };
  //     });

  //     const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
  //       const connections = [];
  //       if (individual.relationships?.father) {
  //         connections.push({
  //           id: `${individual.relationships.father}-${id}`,
  //           source: individual.relationships.father,
  //           target: id,
  //         });
  //       }
  //       if (individual.relationships?.mother) {
  //         connections.push({
  //           id: `${individual.relationships.mother}-${id}`,
  //           source: individual.relationships.mother,
  //           target: id,
  //         });
  //       }
  //       return connections;
  //     });

  //     const layoutedData = getLayoutedElements(nodes, edges);
  //     setData(layoutedData);
  //   }
  // }, [gedcomData, language]);

  // const handleLanguageToggle = () => {
  //   setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  // };

  const handleNodeClick = (_, node) => {
    setSelectedPerson(gedcomData.individuals[node.id]);
  };

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 3, position: "relative" }}>
          {/* Language Toggle Button */}
          <button
            onClick={loadLanguage}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              padding: "8px 12px",
              zIndex: 10,
              cursor: "pointer",
            }}
          >
            {translations.languageToggle}
            {/* {language === "en" ? "Arabic" : "English"} */}
          </button>

          {/* Family Tree */}
          <ReactFlow
            nodes={data.nodes}
            edges={data.edges}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, backgroundColor: "#f1f1f1", padding: "20px" }}>
          {selectedPerson ? (
            <div>
              <h2>Person Details</h2>
              {/* <p>
                <strong>First Name:</strong> {selectedPerson.data.GIVN || "Unknown"}
              </p>
              <p>
                <strong>Last Name:</strong> {selectedPerson.data.SURN || ""}
              </p> */}
              <p>
                <strong>Full Name:</strong> {selectedPerson.data.GIVN || "Unknown"} {selectedPerson.data.SURN || ""}
              </p>
              <p>
                <strong>Date of Birth:</strong> {selectedPerson.data.BIRT?.DATE || "Unknown"}
              </p>
              <p>
                <strong>Alive:</strong> {selectedPerson.data.DEAT ? "No" : "Yes"}
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
