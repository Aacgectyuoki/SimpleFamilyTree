import React from "react";
import Tree from "react-d3-tree";
import { transformToTree } from "../services/treeTransformer";

const FamilyTree = ({ gedcomData }) => {
  if (!gedcomData) {
    return <p>No GEDCOM data available.</p>;
  }

  const treeData = transformToTree(gedcomData);

  if (!treeData) {
    return <p>Failed to build family tree.</p>;
  }

  return (
    <div id="treeWrapper" style={{ width: "100%", height: "600px" }}>
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="elbow"
        translate={{ x: 300, y: 50 }}
        nodeSize={{ x: 200, y: 200 }}
      />
    </div>
  );
};

export default FamilyTree;
