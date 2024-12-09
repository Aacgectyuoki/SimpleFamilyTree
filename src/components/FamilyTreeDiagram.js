import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import { useLocation } from "react-router-dom";
import dagre from "dagre";
import "../styles/FamilyTree.css";

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

const FamilyTreeDiagram = () => {
  const location = useLocation();
  const gedcomData = location.state?.gedcomData;
  const [data, setData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (gedcomData) {
      const nodes = Object.entries(gedcomData.individuals).map(([id, individual]) => ({
        id,
        data: {
          label: (
            <div>
              <h3>{individual.data.NAME?.replace(/\//g, "") || "Unknown"}</h3>
              <p>Born: {individual.data.BIRT?.DATE || "Unknown"}</p>
            </div>
          ),
        },
        position: { x: 0, y: 0 },
      }));

      const edges = Object.entries(gedcomData.individuals).flatMap(([id, individual]) => {
        const edges = [];
        if (individual.relationships?.father) {
          edges.push({
            id: `e-${individual.relationships.father}-${id}`,
            source: individual.relationships.father,
            target: id,
          });
        }
        if (individual.relationships?.mother) {
          edges.push({
            id: `e-${individual.relationships.mother}-${id}`,
            source: individual.relationships.mother,
            target: id,
          });
        }
        return edges;
      });

      const layoutedElements = getLayoutedElements(nodes, edges);
      setData(layoutedElements);
    }
  }, [gedcomData]);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={data.nodes}
          edges={data.edges}
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
