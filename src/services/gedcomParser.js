// gedcomParser.js

/**
 * Parses GEDCOM content and extracts individuals and families.
 * Maps family relationships (children, parents, spouses).
 * @param {string} gedcomContent - The GEDCOM content as a string.
 * @returns {Object} Parsed individuals and families with relationships mapped.
 */
export const parseGedcomFile = async (gedcomContent) => {
  const lines = gedcomContent.split("\n");
  const individuals = {};
  const families = {};

  let currentEntity = null;
  let currentEntityType = null;

  // Parse GEDCOM lines
  lines.forEach((line) => {
    const [level, tag, ...rest] = line.trim().split(" ");
    const value = rest.join(" ");

    if (level === "0") {
      // Save the previous entity
      if (currentEntity) {
        if (currentEntityType === "INDI") individuals[currentEntity.id] = currentEntity;
        if (currentEntityType === "FAM") families[currentEntity.id] = currentEntity;
      }

      // Start a new entity
      if (tag.startsWith("@I")) {
        currentEntity = { id: tag, data: {}, relationships: {} };
        currentEntityType = "INDI";
      } else if (tag.startsWith("@F")) {
        currentEntity = { id: tag, data: {}, relationships: { husband: null, wife: null, children: [] } };
        currentEntityType = "FAM";
      } else {
        currentEntity = null;
        currentEntityType = null;
      }
    } else if (currentEntity) {
      // Populate individual or family data
      if (currentEntityType === "INDI") {
        currentEntity.data[tag] = value;
      } else if (currentEntityType === "FAM") {
        if (tag === "HUSB") currentEntity.relationships.husband = value;
        else if (tag === "WIFE") currentEntity.relationships.wife = value;
        else if (tag === "CHIL") currentEntity.relationships.children.push(value);
      }
    }
  });

  // Add the last entity
  if (currentEntity) {
    if (currentEntityType === "INDI") individuals[currentEntity.id] = currentEntity;
    if (currentEntityType === "FAM") families[currentEntity.id] = currentEntity;
  }

  // Map relationships
  Object.values(families).forEach((family) => {
    const { husband, wife, children } = family.relationships;

    if (husband && individuals[husband]) {
      individuals[husband].relationships.spouse = wife || null;
      individuals[husband].relationships.children = children;
    }

    if (wife && individuals[wife]) {
      individuals[wife].relationships.spouse = husband || null;
      individuals[wife].relationships.children = children;
    }

    children.forEach((child) => {
      if (individuals[child]) {
        individuals[child].relationships.father = husband || null;
        individuals[child].relationships.mother = wife || null;
      }
    });
  });

  return { individuals, families };
};

/**
 * Handles the file upload and parses the GEDCOM file.
 * @param {File} file - The uploaded file object.
 * @returns {Promise<Object>} The parsed GEDCOM data (individuals and families).
 */
export const handleFileUpload = async (file) => {
  try {
    const text = await file.text(); // Read the file's content
    const parsedData = await parseGedcomFile(text); // Parse the GEDCOM content
    console.log("Parsed Data:", parsedData);
    return parsedData;
  } catch (err) {
    console.error("Error processing file:", err);
    throw err;
  }
};
