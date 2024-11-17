import { transformToTree } from "../src/services/treeTransformer";

describe("Tree Transformer", () => {
    const gedcomData = {
      individuals: [
        { id: "@I1@", names: ["John /Doe/"], births: [], deaths: [], parents: [], spouses: ["@F1@"] },
        { id: "@I2@", names: ["Jane /Doe/"], births: [], deaths: [], parents: [], spouses: ["@F1@"] },
      ],
      families: [
        { id: "@F1@", husband: "@I1@", wife: "@I2@", children: [] },
      ],
    };
  
    it("transforms GEDCOM data to tree structure", () => {
      const treeData = transformToTree(gedcomData);
      expect(treeData).toEqual({
        name: "John /Doe/ (undefined)",
        attributes: {
          birth: "Unknown Birth Date",
          death: "Unknown Death Date",
        },
        children: [
          {
            name: "John /Doe/ & Jane /Doe/",
            children: [],
          },
        ],
      });
    });
  });