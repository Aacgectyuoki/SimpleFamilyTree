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
  const [suggestions, setSuggestions] = useState([]);
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => {
        const isAlive = !individual.data.DEAT;
        const gender = individual.data.SEX;

        let backgroundColor = "#e0f7ff"; // Default: very light blue for alive males
        if (!isAlive) backgroundColor = "#a4d8f0";
        if (gender === "F") backgroundColor = isAlive ? "#fde0f7" : "#f0a4d8";

        return {
          id,
          data: {
            label: individual.data.NAME?.replace(/\//g, "") || "Unknown",
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
  }, [gedcomData]);

  const highlightRelatedNodes = (nodeId) => {
    const currentIndividual = gedcomData.individuals[nodeId];

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
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <div style={{ padding: "10px", position: "relative", zIndex: 10 }}>
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
          <div style={{
            position: "absolute",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "250px",
            maxHeight: "150px",
            overflowY: "auto",
          }}>
            {suggestions.map((node) => (
              <div key={node.id} onClick={() => handleSuggestionClick(node.id)} style={{ padding: "8px", cursor: "pointer" }}>
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
          onNodeClick={(event, node) => highlightRelatedNodes(node.id)}
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
