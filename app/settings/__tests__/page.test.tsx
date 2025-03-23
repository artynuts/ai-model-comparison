import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "../page";

// Mock the components used in SettingsPage
jest.mock("@/app/components/StorageSelector", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="storage-selector">Storage Selector Mock</div>
  ),
}));

jest.mock("@/app/components/DataMigration", () => ({
  __esModule: true,
  default: () => <div data-testid="data-migration">Data Migration Mock</div>,
}));

jest.mock("@/app/components/DataValidation", () => ({
  __esModule: true,
  default: () => <div data-testid="data-validation">Data Validation Mock</div>,
}));

jest.mock("@/app/components/DataDeletion", () => ({
  __esModule: true,
  default: () => <div data-testid="data-deletion">Data Deletion Mock</div>,
}));

// Mock the context
jest.mock("@/app/context/StorageContext", () => ({
  useStorage: jest.fn().mockReturnValue({}),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page title and navigation", () => {
    render(<SettingsPage />);

    // Check for page title
    expect(screen.getByText("Settings")).toBeInTheDocument();

    // Check for back link
    const backLink = screen.getByText("Back to Compare");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the Storage section with proper content", () => {
    render(<SettingsPage />);

    // Check for section heading
    expect(screen.getByText("Storage")).toBeInTheDocument();

    // Check for explanatory text
    expect(
      screen.getByText(/Choose where to store your query history and ratings/)
    ).toBeInTheDocument();

    // Check for storage selector component
    expect(screen.getByTestId("storage-selector")).toBeInTheDocument();

    // Check for storage details section
    expect(screen.getByText("Storage Details:")).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL Database:/)).toBeInTheDocument();
    expect(screen.getByText(/Browser Local Storage:/)).toBeInTheDocument();
  });

  it("renders the Data Tools section with all tool components", () => {
    render(<SettingsPage />);

    // Check for section heading
    expect(screen.getByText("Data Tools")).toBeInTheDocument();

    // Check for explanatory text
    expect(
      screen.getByText(/Tools for managing and maintaining your data/)
    ).toBeInTheDocument();

    // Check for all data tool components
    expect(screen.getByTestId("data-migration")).toBeInTheDocument();
    expect(screen.getByTestId("data-validation")).toBeInTheDocument();
    expect(screen.getByTestId("data-deletion")).toBeInTheDocument();
  });

  it("renders all sections with proper structure and accessibility", () => {
    render(<SettingsPage />);

    // Check if there are two main sections with proper roles
    const regions = screen.getAllByRole("region");
    expect(regions).toHaveLength(2);

    // Check section 1 (Storage)
    const storageHeading = screen.getByText("Storage");
    expect(storageHeading).toHaveAttribute("id", "storage-heading");
    const storageSection = storageHeading.closest("section");
    expect(storageSection).toHaveAttribute(
      "aria-labelledby",
      "storage-heading"
    );

    // Check section 2 (Data Tools)
    const dataToolsHeading = screen.getByText("Data Tools");
    expect(dataToolsHeading).toHaveAttribute("id", "data-tools-heading");
    const dataToolsSection = dataToolsHeading.closest("section");
    expect(dataToolsSection).toHaveAttribute(
      "aria-labelledby",
      "data-tools-heading"
    );

    // Alternative way to verify sections using headings
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent("Storage");
    expect(headings[1]).toHaveTextContent("Data Tools");
  });
});
