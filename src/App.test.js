import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import App from "./App";
import FamilyTree from "./components/FamilyTree"; // Import FamilyTree
import { parseGedcomFile } from "./services/gedcomParser";

// Mock the parseGedcomFile function
jest.mock("./services/gedcomParser", () => ({
  parseGedcomFile: jest.fn(),
}));

const mockGedcomData = {
  individuals: [
    { id: "@I1@", names: ["John /Doe/"], births: [], deaths: [], parents: [], spouses: ["@F1@"] },
    { id: "@I2@", names: ["Jane /Doe/"], births: [], deaths: [], parents: [], spouses: ["@F1@"] },
  ],
  families: [
    { id: "@F1@", husband: "@I1@", wife: "@I2@", children: [] },
  ],
};

test("renders GEDCOM Family Tree Viewer heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/GEDCOM Family Tree Viewer/i);
  expect(headingElement).toBeInTheDocument();
});

test("parses and displays GEDCOM data correctly", async () => {
  parseGedcomFile.mockResolvedValue(mockGedcomData);

  render(<App />);
  const input = screen.getByLabelText(/file/i);

  await act(async () => {
    fireEvent.change(input, {
      target: {
        files: [new Blob(["0 HEAD\n1 CHAR UTF-8\n0 TRLR"], { type: "text/plain" })],
      },
    });
  });

  await waitFor(() => {
    expect(parseGedcomFile).toHaveBeenCalled();
    // Check if individuals from the mock GEDCOM data are rendered
    expect(screen.getByText(/John \/Doe\//)).toBeInTheDocument();
    expect(screen.getByText(/Jane \/Doe\//)).toBeInTheDocument();
  });
});

test("displays error for invalid GEDCOM file", async () => {
  parseGedcomFile.mockRejectedValue(new Error("Failed to parse GEDCOM file"));

  render(<App />);
  const input = screen.getByLabelText(/file/i);

  await act(async () => {
    fireEvent.change(input, {
      target: {
        files: [new Blob(["Invalid GEDCOM content"], { type: "text/plain" })],
      },
    });
  });

  await waitFor(() => {
    console.log("parseGedcomFile called:", parseGedcomFile.mock.calls.length);
    expect(parseGedcomFile).toHaveBeenCalled();
    expect(
      screen.getByText(/Failed to parse GEDCOM file. Please check the format and try again./)
    ).toBeInTheDocument();
  });
});

test("renders individuals and families in FamilyTree", () => {
  const gedcomData = {
    individuals: [
      { id: "@I1@", names: ["John /Doe/"], births: [], deaths: [] },
      { id: "@I2@", names: ["Jane /Doe/"], births: [], deaths: [] },
    ],
    families: [{ id: "@F1@", husband: "@I1@", wife: "@I2@", children: [] }],
  };

  render(<FamilyTree gedcomData={gedcomData} />);
  expect(screen.getByText("John /Doe/")).toBeInTheDocument();
  expect(screen.getByText("Jane /Doe/")).toBeInTheDocument();
});
