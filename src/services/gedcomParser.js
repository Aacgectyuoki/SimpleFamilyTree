import GedcomParser from "gedcom-js";

/**
 * Parses a GEDCOM file into a JSON structure.
 * @param {File} file - The GEDCOM file uploaded by the user.
 * @returns {Promise<Object>} - A promise that resolves to the parsed GEDCOM data.
 */
export const parseGedcomFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (!event.target) {
          reject(new Error("FileReader event target is null"));
          return;
        }
  
        const gedcomData = event.target.result;
        console.log("Raw GEDCOM Data:", gedcomData); // Log raw file content
  
        try {
          const parsedResult = GedcomParser.parse(gedcomData);
          console.log("Parsed Result:", parsedResult); // Log parsed JSON
          resolve(parsedResult);
        } catch (error) {
          console.error("Error parsing GEDCOM file:", error.message);
          reject(new Error("Failed to parse GEDCOM file: " + error.message));
        }
      };
  
      reader.onerror = () => reject(new Error("Failed to read the file"));
      reader.readAsText(file);
    });
  };
  



// export const parseGedcomFile = async (file) => {
//   const reader = new FileReader();
//   return new Promise((resolve, reject) => {
//     reader.onload = (event) => {
//       try {
//         const gedcomData = parseGEDCOM(event.target.result);
//         resolve(gedcomData);
//       } catch (error) {
//         reject(error);
//       }
//     };
//     reader.readAsText(file);
//   });
// };
