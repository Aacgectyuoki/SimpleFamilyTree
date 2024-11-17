import parse from 'gedcom-js';

export const parseGedcomFile = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      try {
        const gedcomData = event.target?.result;
        if (!gedcomData) {
          reject(new Error("Failed to read file content."));
          return;
        }
        const parsedData = parse.parse(gedcomData); // Parse the GEDCOM data
        console.log("Parsed Data:", parsedData); // Log for debugging
        resolve(parsedData);
      } catch (error) {
        console.error("Parsing Error:", error);
        reject(error); // Reject with the error for the UI
      }
    };

    reader.readAsText(file);
  });
};
