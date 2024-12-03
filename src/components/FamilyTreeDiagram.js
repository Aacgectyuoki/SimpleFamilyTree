import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => ({
        id,
        data: {
          label: (
            <div className="node-box">
              <h3>{individual.data.NAME || "Unknown"}</h3>
              <p>Born: {individual.data.BIRT || "Unknown"}</p>
              <p>Place: {individual.data.PLAC || "Unknown"}</p>
            </div>
          ),
        },
        style: { width: nodeWidth, height: nodeHeight },
        hidden: false, // Default to visible
      }));

      const edges = Array.from(
        new Map(
          Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
            const edgeMap = [];
            if (individual.relationships?.father) {
              const edgeId = `${individual.relationships.father}-${id}`;
              edgeMap.push([edgeId, { id: edgeId, source: individual.relationships.father, target: id }]); // Correct pair structure
            }
            if (individual.relationships?.mother) {
              const edgeId = `${individual.relationships.mother}-${id}`;
              edgeMap.push([edgeId, { id: edgeId, source: individual.relationships.mother, target: id }]); // Correct pair structure
            }
            return edgeMap; // Ensure this returns an array of [key, value] pairs
          })
        ).entries() // Use entries() instead of values() to ensure compatibility
      ).map(([key, value]) => value); // Extract only the values for edges

      const layoutedData = getLayoutedElements(nodes, edges);
      setData(layoutedData);
    }
  }, [gedcomData]);

  const handleNodeClick = (event, node) => {
    console.log("Node clicked:", node);
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

      // Update visibility for nodes
      const updatedNodes = prevData.nodes.map((n) => ({
        ...n,
        hidden: !relatedNodes.has(n.id), // Hide nodes not in the related set
      }));

      // Update visibility for edges
      const updatedEdges = prevData.edges.filter(
        (edge) =>
          relatedNodes.has(edge.source) && relatedNodes.has(edge.target)
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
          onNodeClick={handleNodeClick} // Attach the handler here
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