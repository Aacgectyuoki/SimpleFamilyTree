import { parseGedcomFile } from '../src/services/gedcomParser';

describe('GEDCOM Parser', () => {
    const mockFile = new Blob([
      `
      0 HEAD
      1 GEDC
      2 VERS 5.5.1
      0 @I1@ INDI
      1 NAME John /Doe/
      1 SEX M
      1 BIRT
      2 DATE 01 JAN 1900
      0 TRLR
      `
    ], { type: 'text/plain' });
  
    it('should parse GEDCOM file successfully', async () => {
      const parsedData = await parseGedcomFile(mockFile);
      expect(parsedData).toHaveProperty('individuals');
    });
  
    it('should handle invalid GEDCOM file gracefully', async () => {
      const invalidFile = new Blob(["Invalid GEDCOM content"], { type: 'text/plain' });
      await expect(parseGedcomFile(invalidFile)).rejects.toThrow("Error parsing GEDCOM file");
    });
  });