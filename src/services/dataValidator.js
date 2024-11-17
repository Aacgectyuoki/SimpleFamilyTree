export const validateGedcomData = (gedcomData) => {
    if (!gedcomData) {
      throw new Error("GEDCOM data is null or undefined.");
    }
  
    const { individuals, families } = gedcomData;
  
    if (!Array.isArray(individuals) || !Array.isArray(families)) {
      throw new Error("Invalid GEDCOM data: 'individuals' and 'families' must be arrays.");
    }
  
    individuals.forEach((individual) => {
      if (!individual.id || typeof individual.id !== "string") {
        throw new Error(`Invalid individual entry: ${JSON.stringify(individual)}`);
      }
    });
  
    families.forEach((family) => {
      if (!family.id || typeof family.id !== "string") {
        throw new Error(`Invalid family entry: ${JSON.stringify(family)}`);
      }
    });
  
    return true; // Data is valid
  };
  