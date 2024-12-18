import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, ReactFlowProvider } from "react-flow-renderer";
import dagre from "dagre";
import translateText from "../utils/translate";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: "TB" });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = dagreGraph.node(node.id);
      return { ...node, position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 } };
    }),
    edges,
  };
};

const FamilyTreeDiagram = ({ gedcomData, language }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [translatedLabels, setTranslatedLabels] = useState({
    personDetails: "Person Details",
    name: "Name",
    dateOfBirth: "Date of Birth",
    alive: "Alive?",
    yes: "Yes",
    no: "No",
    father: "Father",
    mother: "Mother",
    children: "Children",
    unknown: "Unknown",
    none: "None",
    selectPerson: "Select a person to see details",
  });

  // Generate nodes and edges
  useEffect(() => {
    if (!gedcomData) return;

    const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
      const isAlive = !individual.data.DEAT;
      const gender = individual.data.SEX;

      const backgroundColor = isAlive
        ? gender === "F"
          ? "#fde0f7"
          : "#e0f7ff"
        : gender === "F"
        ? "#f0a4d8"
        : "#a4d8f0";

      return {
        id,
        data: { label: individual.data.NAME || translatedLabels.unknown },
        style: { backgroundColor, width: nodeWidth, height: nodeHeight },
        position: { x: 0, y: 0 },
      };
    });

    const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
      const connections = [];
      if (individual.relationships?.father)
        connections.push({ id: `${individual.relationships.father}-${id}`, source: individual.relationships.father, target: id });
      if (individual.relationships?.mother)
        connections.push({ id: `${individual.relationships.mother}-${id}`, source: individual.relationships.mother, target: id });
      return connections;
    });

    const layoutedData = getLayoutedElements(nodes, edges);
    setData(layoutedData);
  }, [gedcomData]);

  // Translate static labels
  useEffect(() => {
    const translateLabels = async () => {
      const labels = [
        "Person Details",
        "Name",
        "Date of Birth",
        "Alive?",
        "Yes",
        "No",
        "Father",
        "Mother",
        "Children",
        "Unknown",
        "None",
        "Select a person to see details",
      ];
      const translated = await Promise.all(labels.map((label) => translateText(label, "en", language)));
      setTranslatedLabels({
        personDetails: translated[0],
        name: translated[1],
        dateOfBirth: translated[2],
        alive: translated[3],
        yes: translated[4],
        no: translated[5],
        father: translated[6],
        mother: translated[7],
        children: translated[8],
        unknown: translated[9],
        none: translated[10],
        selectPerson: translated[11],
      });
    };
    if (language === "ar") translateLabels();
  }, [language]);

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Family Tree Diagram */}
        <div style={{ flex: 3 }}>
          <ReactFlow nodes={data.nodes} edges={data.edges} onNodeClick={(_, node) => setSelectedPerson(gedcomData.individuals[node.id])} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#f1f1f1" }}>
          {selectedPerson ? (
            <div>
              <h2>{translatedLabels.personDetails}</h2>
              <p><strong>{translatedLabels.name}:</strong> {selectedPerson.data.NAME || translatedLabels.unknown}</p>
              <p><strong>{translatedLabels.dateOfBirth}:</strong> {selectedPerson.data.BIRT?.DATE || translatedLabels.unknown}</p>
              <p><strong>{translatedLabels.alive}:</strong> {selectedPerson.data.DEAT ? translatedLabels.no : translatedLabels.yes}</p>
            </div>
          ) : (
            <h2>{translatedLabels.selectPerson}</h2>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDiagram;
