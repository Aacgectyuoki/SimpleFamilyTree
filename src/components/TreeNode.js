import React from "react";

const TreeNode = ({ nodeData }) => {
  const getClassName = () => {
    if (nodeData.gender === "male") {
      return nodeData.deathYear
        ? "bg-green-600 text-white"
        : "bg-green-300 text-black";
    } else {
      return nodeData.deathYear
        ? "bg-pink-600 text-white"
        : "bg-pink-300 text-black";
    }
  };

  return (
    <div className={`p-4 rounded shadow-md ${getClassName()}`}>
      <h3 className="text-lg font-bold">{nodeData.name}</h3>
      {nodeData.birthYear && <p className="text-sm">Born: {nodeData.birthYear}</p>}
      {nodeData.deathYear && <p className="text-sm">Died: {nodeData.deathYear}</p>}
    </div>
  );
};

export default TreeNode;