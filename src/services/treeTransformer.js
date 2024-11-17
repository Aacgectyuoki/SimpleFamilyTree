export const transformToTree = (gedcomData) => {
    if (!gedcomData || !gedcomData.individuals || !gedcomData.families) {
      console.error("Invalid GEDCOM data structure:", gedcomData);
      return null;
    }
  
    const { individuals, families } = gedcomData;
  
    const individualMap = individuals.reduce((acc, ind) => {
      acc[ind.id] = {
        name: ind.names?.[0]?.value || "Unknown",
        attributes: {
          birth: ind.birth?.date || "Unknown",
          death: ind.death?.date || "Unknown",
        },
        children: [],
      };
      return acc;
    }, {});
  
    families.forEach((fam) => {
      const husband = individualMap[fam.husband];
      const wife = individualMap[fam.wife];
  
      if (husband && wife) {
        husband.spouse = wife;
        wife.spouse = husband;
      }
  
      fam.children.forEach((childId) => {
        const child = individualMap[childId];
        if (child) {
          if (husband) husband.children.push(child);
          if (wife) wife.children.push(child);
        }
      });
    });
  
    const rootId = individuals.find((ind) => !ind.families?.length)?.id || individuals[0]?.id;
    return individualMap[rootId];
  };
  