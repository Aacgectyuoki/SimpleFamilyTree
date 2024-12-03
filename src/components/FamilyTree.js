import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, ReactFlowProvider } from "react-flow-renderer";
import dagre from "dagre";
import "../styles/FamilyTree.css";

// Dagre configuration for layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 100;

// Layout helper function
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

const FamilyTree = ({ gedcomData }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => ({
        id,
        data: {
          label: (
            <div className={`node-box ${individual.data.highlight ? 'highlight' : ''}`}>
              <h3>{individual.data.NAME || 'Unknown'}</h3>
              <p>Born: {individual.data.BIRT || 'Unknown'}</p>
              <p>Place: {individual.data.PLAC || 'Unknown'}</p>
            </div>
          ),
          highlight: false, // Default not highlighted
        },
        position: { x: 0, y: 0 }, // Placeholder positions; layout handled later
        visible: true, // Default all nodes to visible
      }));
  
      const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
        const edges = [];
        if (individual.relationships?.father) {
          edges.push({
            id: `${individual.relationships.father}-${id}`,
            source: individual.relationships.father,
            target: id,
          });
        }
        if (individual.relationships?.mother) {
          edges.push({
            id: `${individual.relationships.mother}-${id}`,
            source: individual.relationships.mother,
            target: id,
          });
        }
        return edges;
      });
  
      const layoutedData = getLayoutedElements(nodes, edges);
      setData(layoutedData);
      console.log("Parsed GEDCOM Data:", gedcomData);
    }
  }, [gedcomData]);
  

  // Handle node click
  const handleNodeClick = (event, node) => {
    setData((prevData) => {
      const relatedNodes = new Set(); // Track nodes to display
  
      // Add the clicked node
      relatedNodes.add(node.id);
  
      // Add parents
      prevData.edges.forEach((edge) => {
        if (edge.target === node.id) {
          relatedNodes.add(edge.source); // Add parent
        }
      });
  
      // Add children
      prevData.edges.forEach((edge) => {
        if (edge.source === node.id) {
          relatedNodes.add(edge.target); // Add child
        }
      });
  
      // Add spouses (optional: assuming spouse relationships are edges too)
      prevData.edges.forEach((edge) => {
        if (
          (edge.source === node.id && prevData.nodes.find((n) => n.id === edge.target)?.data.isSpouse) ||
          (edge.target === node.id && prevData.nodes.find((n) => n.id === edge.source)?.data.isSpouse)
        ) {
          relatedNodes.add(edge.source === node.id ? edge.target : edge.source); // Add spouse
        }
      });
  
      // Update visibility and add highlighting
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        visible: relatedNodes.has(n.id),
        data: {
          ...n.data,
          highlight: n.id === node.id, // Highlight the clicked node
        },
      }));
  
      const updatedEdges = prevData.edges.filter(
        (edge) => relatedNodes.has(edge.source) && relatedNodes.has(edge.target)
      );
  
      return { ...prevData, nodes: updatedNodes, edges: updatedEdges };
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
      <div style={{ width: "100%", height: "100vh" }}>
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
