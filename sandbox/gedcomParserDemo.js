import { parseGedcomFile } from "../src/services/gedcomParser";

const demoGedcomString = `
    0 HEAD
    1 GEDC
    2 VERS 5.5.1
    0 @I1@ INDI
    1 NAME John /Doe/
    1 SEX M
    1 BIRT
    2 DATE 01 JAN 1900
    0 TRLR
`;

const mockFile = new Blob([demoGedcomString], { type: "text/plain" });

(async () => {
  try {
    const parsedData = await parseGedcomFile(mockFile);
    console.log("Parsed GEDCOM Data:", parsedData);
  } catch (error) {
    console.error("GEDCOM Parsing Error:", error);
  }
})();
