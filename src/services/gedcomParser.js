import parse from 'gedcom-js';

export const parseGedcomFile = async (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      try {
        const gedcomData = event.target ? event.target.result : null;
        if (!gedcomData) {
          reject(new Error("Failed to read file"));
          return;
        }
        const parsedData = parse.parse(gedcomData);
        resolve(parsedData);
      } catch (error) {
        console.error("Error parsing GEDCOM file:", error);
        reject(error);
      }
    };

    reader.readAsText(file);
  });
};