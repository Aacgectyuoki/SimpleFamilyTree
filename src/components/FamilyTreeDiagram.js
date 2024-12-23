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
  const [translatedDetails, setTranslatedDetails] = useState({});
  const reactFlowInstance = useRef(null);

  const loadLanguage = async () => {
    const newTranslations = await loadTranslations(language === "en" ? "ar" : "en");
    setTranslations(newTranslations);
    setLanguage(language === "en" ? "ar" : "en");
  };

  // const formatDate = async (dateText) => {
  //   if (!dateText) return textMap[language].unknown;

  //   const parts = dateText.split(" ");
  //   const translatedParts = await Promise.all(
  //     parts.map((part) => translateText(part, language))
  //   );

  //   return translatedParts.join(" ");
  // };

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

        // Edges
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

  useEffect(() => {
    const translateDetails = async () => {
      if (!selectedPerson) return;

      const birthDate = selectedPerson.data.BIRT?.DATE
        ? await formatDate(selectedPerson.data.BIRT.DATE)
        : translations.unknown;
      const deathDate = selectedPerson.data.DEAT?.DATE
        ? await formatDate(selectedPerson.data.DEAT.DATE)
        : translations.unknown;
      const firstName = selectedPerson.data.GIVN
        ? await translateText(selectedPerson.data.GIVN, language)
        : translations.unknown;
      const lastName = selectedPerson.data.SURN
        ? await translateText(selectedPerson.data.SURN, language)
        : translations.unknown;

      setTranslatedDetails({
        birthDate,
        deathDate,
        firstName,
        lastName,
      });
    };

    translateDetails();
  }, [selectedPerson, language]);

  const handleNodeClick = (_, node) => {
    setSelectedPerson(gedcomData.individuals[node.id]);
  };

  const formatDate = async (dateText) => {
    if (!dateText) return translations.unknown;

    const parts = dateText.split(" ");
    const translatedParts = await Promise.all(
      parts.map((part) => translateText(part, language))
    );

    return translatedParts.join(" ");
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
              <h2>{translations.personDetails}</h2>
              <p>
                <strong>{translations.firstName}:</strong> {translatedDetails.firstName}
              </p>
              <p>
                <strong>{translations.lastName}:</strong> {translatedDetails.lastName}
              </p>
              <p>
                <strong>{translations.dateOfBirth}:</strong>  {translatedDetails.dateOfBirth}
              </p>
              <p>
                <strong>{translations.gender}:</strong> {selectedPerson.data.SEX === "M" ? translations.male : translations.female}
              </p>
              <p>
                <strong>{translations.alive}:</strong> {selectedPerson.data.DEAT ? translations.no : translations.yes}
              </p>
              {selectedPerson.data.DEAT && (
                <p>
                  <strong>{translations.dateOfDeath}:</strong> {translatedDetails.deathDate}
                </p>
              )}
            </div>
          ) : (
            <h2>{translations.selectPerson}</h2>
          )}
        </div>

      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDiagram;