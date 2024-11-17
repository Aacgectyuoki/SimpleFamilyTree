export const parseGedcomFile = async (file) => {
  const text = await file.text();
  console.log("Raw GEDCOM file content:", text);

  const lines = text.split("\n");
  console.log("GEDCOM Lines:", lines);

  const individuals = [];
  const families = [];
  let currentIndividual = null;
  let currentFamily = null;

  lines.forEach((line) => {
    const [level, tag, ...rest] = line.trim().split(" ");
    const value = rest.join(" ");
    console.log("Parsed line:", { level, tag, value });

    if (value === "INDI") {
      if (currentIndividual) individuals.push(currentIndividual);
      currentIndividual = { id: tag, names: [], births: [], deaths: [] };
    } else if (value === "FAM") {
      if (currentFamily) families.push(currentFamily);
      currentFamily = { id: tag, husband: null, wife: null, children: [] };
    } else if (tag === "NAME" && currentIndividual) {
      currentIndividual.names.push(value);
    } else if (tag === "BIRT" && currentIndividual) {
      currentIndividual.births.push({});
    } else if (tag === "DEAT" && currentIndividual) {
      currentIndividual.deaths.push({});
    } else if (level === "2" && currentIndividual) {
      if (tag === "DATE" && currentIndividual.births.length) {
        currentIndividual.births[currentIndividual.births.length - 1].date = value;
      } else if (tag === "PLAC" && currentIndividual.births.length) {
        currentIndividual.births[currentIndividual.births.length - 1].place = value;
      } else if (tag === "DATE" && currentIndividual.deaths.length) {
        currentIndividual.deaths[currentIndividual.deaths.length - 1].date = value;
      } else if (tag === "PLAC" && currentIndividual.deaths.length) {
        currentIndividual.deaths[currentIndividual.deaths.length - 1].place = value;
      }
    } else if (tag === "HUSB" && currentFamily) {
      currentFamily.husband = value;
    } else if (tag === "WIFE" && currentFamily) {
      currentFamily.wife = value;
    } else if (tag === "CHIL" && currentFamily) {
      currentFamily.children.push(value);
    }
  });

  if (currentIndividual) individuals.push(currentIndividual);
  if (currentFamily) families.push(currentFamily);

  console.log("Final Individuals Array:", individuals);
  console.log("Final Families Array:", families);

  return { individuals, families };
};


// export const parseGedcomFile = async (file) => {
//   const text = await file.text();
//   console.log("Raw GEDCOM file content:", text);

//   const lines = text.split("\n");
//   console.log("GEDCOM Lines:", lines);

//   const individuals = [];
//   const families = [];
//   let currentIndividual = null;
//   let currentFamily = null;

//   lines.forEach((line) => {
//     console.log("Processing line:", line);
//     const [level, tag, ...rest] = line.trim().split(" ");
//     const value = rest.join(" ");
//     console.log("Parsed line:", { level, tag, value });

//     if (tag === "INDI") {
//       if (currentIndividual) {
//         console.log("Completed Individual:", currentIndividual);
//         individuals.push(currentIndividual);
//       }
//       currentIndividual = { id: value, names: [], births: [], deaths: [] };
//       console.log("New Individual Created:", currentIndividual);
//     } else if (tag === "NAME" && currentIndividual) {
//       currentIndividual.names.push(value);
//       console.log("Updated Individual with Name:", currentIndividual);
//     } else if (tag === "BIRT" && currentIndividual) {
//       currentIndividual.births.push({});
//       console.log("Added Birth Event to Individual:", currentIndividual);
//     } else if (tag === "DEAT" && currentIndividual) {
//       currentIndividual.deaths.push({});
//       console.log("Added Death Event to Individual:", currentIndividual);
//     } else if (level === "2" && currentIndividual) {
//       if (tag === "DATE" && currentIndividual.births.length) {
//         currentIndividual.births[currentIndividual.births.length - 1].date = value;
//         console.log("Updated Birth Date:", currentIndividual.births[currentIndividual.births.length - 1]);
//       } else if (tag === "PLAC" && currentIndividual.births.length) {
//         currentIndividual.births[currentIndividual.births.length - 1].place = value;
//         console.log("Updated Birth Place:", currentIndividual.births[currentIndividual.births.length - 1]);
//       } else if (tag === "DATE" && currentIndividual.deaths.length) {
//         currentIndividual.deaths[currentIndividual.deaths.length - 1].date = value;
//         console.log("Updated Death Date:", currentIndividual.deaths[currentIndividual.deaths.length - 1]);
//       } else if (tag === "PLAC" && currentIndividual.deaths.length) {
//         currentIndividual.deaths[currentIndividual.deaths.length - 1].place = value;
//         console.log("Updated Death Place:", currentIndividual.deaths[currentIndividual.deaths.length - 1]);
//       }
//     }

//     if (tag === "FAM") {
//       if (currentFamily) {
//         console.log("Completed Family:", currentFamily);
//         families.push(currentFamily);
//       }
//       currentFamily = { id: value, husband: null, wife: null, children: [] };
//       console.log("New Family Created:", currentFamily);
//     } else if (tag === "HUSB" && currentFamily) {
//       currentFamily.husband = value;
//       console.log("Added Husband to Family:", currentFamily);
//     } else if (tag === "WIFE" && currentFamily) {
//       currentFamily.wife = value;
//       console.log("Added Wife to Family:", currentFamily);
//     } else if (tag === "CHIL" && currentFamily) {
//       currentFamily.children.push(value);
//       console.log("Added Child to Family:", currentFamily);
//     }
//   });

//   if (currentIndividual) individuals.push(currentIndividual);
//   if (currentFamily) families.push(currentFamily);

//   console.log("Final Individuals Array:", individuals);
//   console.log("Final Families Array:", families);

//   return { individuals, families };
// };