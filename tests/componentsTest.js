import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GedcomUploader from "../src/components/gedcomUploader";
import FamilyTree from "../src/components/FamilyTree";

describe("GedcomUploader Component", () => {
    it("renders without crashing", () => {
      render(<GedcomUploader onDataLoaded={jest.fn()} />);
      expect(screen.getByText(/No file selected/)).toBeInTheDocument();
    });
  
    it("calls onDataLoaded with parsed data on valid file upload", async () => {
      const mockOnDataLoaded = jest.fn();
      render(<GedcomUploader onDataLoaded={mockOnDataLoaded} />);
      const input = screen.getByLabelText(/file/i);
  
      fireEvent.change(input, {
        target: {
          files: [new Blob(["0 HEAD\n1 CHAR UTF-8\n0 TRLR"], { type: "text/plain" })],
        },
      });
  
      await screen.findByText(/No file selected/);
      expect(mockOnDataLoaded).toHaveBeenCalled();
    });
  });
  
  describe("FamilyTree Component", () => {
    it("renders tree data correctly", () => {
      const gedcomData = {
        individuals: [
          { id: "@I1@", names: ["John /Doe/"], births: [], deaths: [], parents: [], spouses: [] },
        ],
        families: [],
      };
  
      render(<FamilyTree gedcomData={gedcomData} />);
      expect(screen.getByText(/John \/Doe\//)).toBeInTheDocument();
    });
  
    it("displays error for invalid data", () => {
      render(<FamilyTree gedcomData={null} />);
      expect(screen.getByText(/No tree data available/)).toBeInTheDocument();
    });
  });