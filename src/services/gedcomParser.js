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
  let currentTag = null;
  let currentParentTag = null; // Explicit parent context for BIRT, DEAT, MARR, etc.

  lines.forEach((line) => {
    const [level, tag, ...rest] = line.trim().split(" ");
    const value = rest.join(" ");

    if (level === "0") {
      // Store the previous entity before starting a new one
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
      currentTag = null;
      currentParentTag = null; // Reset parent context when a new entity begins
    } else if (currentEntity) {
      if (tag === "BIRT" || tag === "DEAT" || tag === "BURI" || tag === "MARR" || tag === "CHAN") {
        // Create nested objects for BIRT, DEAT, CHAN, etc.
        currentEntity.data[tag] = currentEntity.data[tag] || {};
        currentParentTag = tag; // Set current parent context (e.g., BIRT)
      } else if (["DATE", "PLAC", "CAUS", "TIME"].includes(tag)) {
        // Attach DATE, PLAC, and TIME to the current parent context
        if (currentParentTag && currentEntity.data[currentParentTag]) {
          currentEntity.data[currentParentTag][tag] = value;
        }
      } else if (tag === "CHIL") {
        // Associate children with families
        currentEntity.relationships.children.push(value);
      } else if (tag === "HUSB") {
        // Associate husband with family
        currentEntity.relationships.husband = value;
      } else if (tag === "WIFE") {
        // Associate wife with family
        currentEntity.relationships.wife = value;
      } else if (tag === "CONC") {
        // Handle CONC (concatenation) for the most recent tag
        if (currentTag && currentEntity.data[currentTag]) {
          currentEntity.data[currentTag] += ` ${value}`;
        }
      } else if (tag === "CONT") {
        // Handle CONT (continuation) for the most recent tag
        if (currentTag && currentEntity.data[currentTag]) {
          currentEntity.data[currentTag] += `\n${value}`;
        }
      } else {
        // Store simple key-value pairs
        currentEntity.data[tag] = value;
        currentTag = tag; // Track the most recent tag
      }
    }
  });

  // Store the last entity
  if (currentEntity) {
    if (currentEntityType === "INDI") individuals[currentEntity.id] = currentEntity;
    if (currentEntityType === "FAM") families[currentEntity.id] = currentEntity;
  }

  // Map relationships
  Object.values(families).forEach((family) => {
    const { husband, wife, children } = family.relationships;

    children.forEach((childId) => {
      if (individuals[childId]) {
        if (husband && individuals[husband]) {
          individuals[childId].relationships.father = husband;
          individuals[husband].relationships.children =
            individuals[husband].relationships.children || [];
          if (!individuals[husband].relationships.children.includes(childId)) {
            individuals[husband].relationships.children.push(childId);
          }
        }

        if (wife && individuals[wife]) {
          individuals[childId].relationships.mother = wife;
          individuals[wife].relationships.children =
            individuals[wife].relationships.children || [];
          if (!individuals[wife].relationships.children.includes(childId)) {
            individuals[wife].relationships.children.push(childId);
          }
        }
      }
    });
  });

  // Merge families where parents share children
  Object.values(individuals).forEach((individual) => {
    const { father, mother } = individual.relationships;
    if (father && mother) {
      // Ensure both parents share the same children
      individuals[father].relationships.children = [
        ...new Set([
          ...(individuals[father].relationships.children || []),
          ...individuals[mother].relationships.children,
        ]),
      ];
      individuals[mother].relationships.children = individuals[father].relationships.children;
    }
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
    const text = await file.text();
    const parsedData = await parseGedcomFile(text);
    console.log("Parsed Data:", JSON.stringify(parsedData, null, 2));
    return parsedData;
  } catch (err) {
    console.error("Error processing file:", err);
    throw err;
  }
};
