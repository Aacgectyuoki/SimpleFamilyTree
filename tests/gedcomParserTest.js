import { parseGedcomFile } from '../src/services/gedcomParser';

describe('GEDCOM Parser', () => {
  const mockFile = new Blob(
    [
      `
      0 HEAD
      1 SUBM @SUBM1@
      1 SOUR Ancestry.com Family Trees
      2 NAME Ancestry.com Member Trees
      2 VERS 2024.01
      2 _TREE Dell-Thibodeau Family Tree
      3 RIN 162125283
      2 CORP Ancestry.com
      3 PHON 801-705-7000
      3 ADDR 1300 West Traverse Parkway
      1 DATE 4 Nov 2024
      1 GEDC
      2 VERS 5.5.1
      2 FORM LINEAGE-LINKED
      1 CHAR UTF-8
      0 @SUBM1@ SUBM
      1 NAME Ancestry.com Member Trees Submitter
      0 @I332109645536@ INDI
      1 NAME Max /Dell-Thibodeau/
      2 GIVN Max
      2 SURN Dell-Thibodeau
      1 SEX M
      1 FAMC @F1@
      1 FAMC @F2@
      1 BIRT
      2 DATE 1996
      2 PLAC New York City, New York, USA
      0 @I332109645544@ INDI
      1 NAME Michael /Thibodeau/
      2 GIVN Michael
      2 SURN Thibodeau
      1 SEX M
      1 FAMS @F1@
      1 BIRT
      2 DATE 1965
      2 PLAC San Francisco, California, USA
      0 @I332109645562@ INDI
      1 NAME Doris /Dell/
      2 GIVN Doris
      2 SURN Dell
      1 SEX F
      1 FAMS @F2@
      1 BIRT
      2 DATE 1959
      2 PLAC Frankfurt am Main, Hesse, Germany
      0 @F1@ FAM
      1 HUSB @I332109645544@
      1 CHIL @I332109645536@
      0 @F2@ FAM
      1 WIFE @I332109645562@
      1 CHIL @I332109645536@
      0 TRLR
      `,
    ],
    { type: 'text/plain' }
  );

  it('should parse GEDCOM file successfully', async () => {
    const parsedData = await parseGedcomFile(mockFile);
    expect(parsedData).toHaveProperty('individuals');
    expect(parsedData.individuals.length).toBe(3);

    expect(parsedData.individuals[0]).toEqual({
      id: '@I332109645536@',
      names: ['Max /Dell-Thibodeau/'],
      births: [{ date: '1996', place: 'New York City, New York, USA' }],
      deaths: [],
      parents: ['@F1@', '@F2@'],
    });

    expect(parsedData.families.length).toBe(2);
    expect(parsedData.families[0]).toEqual({
      id: '@F1@',
      husband: '@I332109645544@',
      children: ['@I332109645536@'],
    });
  });

  it('should handle invalid GEDCOM file gracefully', async () => {
    const invalidFile = new Blob(['Invalid GEDCOM content'], {
      type: 'text/plain',
    });
    await expect(parseGedcomFile(invalidFile)).rejects.toThrow(
      'Error parsing GEDCOM file'
    );
  });

  it('should handle GEDCOM file with missing individuals', async () => {
    const edgeCaseFile = new Blob(
      [
        `
        0 HEAD
        1 GEDC
        2 VERS 5.5.1
        2 FORM LINEAGE-LINKED
        1 CHAR UTF-8
        0 TRLR
        `,
      ],
      { type: 'text/plain' }
    );

    const parsedData = await parseGedcomFile(edgeCaseFile);
    expect(parsedData.individuals).toEqual([]);
    expect(parsedData.families).toEqual([]);
  });

  it('should correctly map relationships in GEDCOM data', async () => {
    const parsedData = await parseGedcomFile(mockFile);
    const max = parsedData.individuals.find(
      (ind) => ind.id === '@I332109645536@'
    );
    expect(max.parents).toEqual(['@F1@', '@F2@']);
  });
});
