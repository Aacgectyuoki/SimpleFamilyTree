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
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => ({
        id,
        data: {
          label: (
            <div className="node-box">
              {id === selectedNodeId && (
                <div
                  style={{
                    position: "absolute",
                    top: -20, // Adjust position above the node
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "4px solid rgba(0, 0, 255, 0.5)", // Transparent neon blue border
                    boxShadow: "0 0 10px 4px rgba(0, 0, 255, 0.7)", // Glowing effect
                    backgroundColor: "rgba(0, 0, 255, 0.2)", // Light transparent fill
                    pointerEvents: "none", // Make it non-interactive
                  }}
                />
              )}
              <h3>{individual.data.NAME?.replace(/\//g, "") || "Unknown"}</h3> {/* Remove slashes */}
              <p>Born: {individual.data.DATE || "Unknown"}</p>
              <p>Place: {individual.data.PLAC || "Unknown"}</p>
            </div>
          ),
        },
        style: {
          width: nodeWidth,
          height: nodeHeight,
        },
        hidden: false,
      }));      

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
  }, [gedcomData, selectedNodeId]);


  const handleNodeClick = (event, node) => {
    console.log("Node clicked:", node);
    setSelectedNodeId(node.id);

    // Center the selected node
    if (reactFlowInstance.current) {
      const nodePosition = node.position;
      reactFlowInstance.current.setCenter(
        nodePosition.x + nodeWidth / 2, // Center the node horizontally
        nodePosition.y + nodeHeight / 2, // Center the node vertically
        {
          zoom: 1.5, // Optional: Adjust zoom level
        }
      );
    }
  
    setData((prevData) => {
      const relatedNodes = new Set();
  
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
  
      // Add spouse if available
      const spouseId = gedcomData.individuals[node.id]?.relationships?.spouse;
      if (spouseId) {
        relatedNodes.add(spouseId);
      }
  
      // Update nodes
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        hidden: !relatedNodes.has(n.id), // Hide nodes not in the related set
      }));
  
      // Update edges
      const updatedEdges = prevData.edges.filter(
        (edge) =>
          relatedNodes.has(edge.source) && relatedNodes.has(edge.target) // Only keep edges between related nodes
      );
  
      console.log("Final Related Nodes:", Array.from(relatedNodes));
      console.log("Updated Nodes:", updatedNodes);
      console.log("Updated Edges:", updatedEdges);
  
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
          onInit={(instance) => (reactFlowInstance.current = instance)} // Store React Flow instance
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