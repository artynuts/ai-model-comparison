import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RatingsPage, { getRatingColor, getRatingSymbol } from "../page";
import { AIResponse, ResponseRating } from "@/app/types";
import { useStorage } from "@/app/context/StorageContext";

// Mock the StorageContext hook
jest.mock("@/app/context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

// Mock the Link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("RatingsPage", () => {
  const createMockRating = (value: boolean | null): ResponseRating => ({
    accuracy: value,
    relevance: value,
    completeness: value,
    concise: value,
    unbiased: value,
  });

  const createMockResponse = (
    modelName: string,
    id: string,
    hasRating: boolean | null = null
  ): AIResponse => ({
    modelName,
    id,
    provider: `${modelName} Provider`,
    version: "1.0",
    description: `${modelName} Description`,
    response: `${modelName} Response`,
    latency: 100,
    rating: hasRating !== null ? createMockRating(hasRating) : undefined,
  });

  const mockHistory = [
    {
      id: "1",
      query: "Test query 1",
      timestamp: 1630000000000,
      responses: [
        createMockResponse("GPT-4", "gpt-1", true),
        createMockResponse("Claude", "claude-1", false),
      ],
    },
    {
      id: "2",
      query: "Test query 2",
      timestamp: 1630000001000,
      responses: [
        createMockResponse("GPT-4", "gpt-2", null),
        createMockResponse("Claude", "claude-2"),
        createMockResponse("Gemini", "gemini-2", true),
      ],
    },
  ];

  beforeEach(() => {
    // Setup the mock implementation for useStorage
    (useStorage as jest.Mock).mockReturnValue({
      history: mockHistory,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Utility Functions", () => {
    it("getRatingColor returns correct color classes", () => {
      // Positive rating (true)
      expect(getRatingColor(true)).toBe("bg-green-100 text-green-700");

      // Negative rating (false)
      expect(getRatingColor(false)).toBe("bg-red-100 text-red-700");

      // No rating (null)
      expect(getRatingColor(null)).toBe("bg-gray-50 text-gray-500");
    });

    it("getRatingSymbol returns correct elements", () => {
      // Positive rating (true)
      const positiveResult = getRatingSymbol(true);
      const { container: positiveContainer } = render(<>{positiveResult}</>);
      // Should render thumbs up icon
      expect(positiveContainer.querySelector("svg")).toBeInTheDocument();

      // Negative rating (false)
      const negativeResult = getRatingSymbol(false);
      const { container: negativeContainer } = render(<>{negativeResult}</>);
      // Should render thumbs down icon
      expect(negativeContainer.querySelector("svg")).toBeInTheDocument();

      // No rating (null)
      expect(getRatingSymbol(null)).toBe("-");
    });
  });

  it("renders the ratings page title", () => {
    render(<RatingsPage />);
    expect(screen.getByText("Ratings Summary")).toBeInTheDocument();
    expect(screen.getByText("Back to Compare")).toBeInTheDocument();
  });

  it("renders section headings for different views", () => {
    render(<RatingsPage />);
    expect(screen.getByText("By Model")).toBeInTheDocument();
    expect(screen.getByText("By Category")).toBeInTheDocument();
  });

  it("displays all model names in the table", () => {
    render(<RatingsPage />);

    // Check for model headers in the By Model section
    expect(screen.getAllByText("GPT-4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gemini").length).toBeGreaterThan(0);
  });

  it("displays all category labels in the table", () => {
    render(<RatingsPage />);

    // Check for category labels in both sections
    expect(screen.getAllByText("Accuracy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Relevance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Complete").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Concise").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unbiased").length).toBeGreaterThan(0);
  });

  it("displays query text with links to history", () => {
    render(<RatingsPage />);

    // Get all query links (note: they appear twice because they're in both tables)
    const query1Links = screen.getAllByText("Test query 1");
    const query2Links = screen.getAllByText("Test query 2");

    // Check that they exist
    expect(query1Links.length).toBe(2); // Once in each table
    expect(query2Links.length).toBe(2); // Once in each table

    // Check that they have correct href attributes
    expect(query1Links[0].closest("a")).toHaveAttribute(
      "href",
      "/history?query=Test%20query%201"
    );
    expect(query2Links[0].closest("a")).toHaveAttribute(
      "href",
      "/history?query=Test%20query%202"
    );
  });

  it("renders correct number of table cells based on data", () => {
    render(<RatingsPage />);

    // 3 models × 5 categories × 2 queries = 30 rating cells in By Model view
    // Plus 2 more for the query cells = 32 total cells in By Model

    // 5 categories × 3 models × 2 queries = 30 rating cells in By Category view
    // Plus 2 more for the query cells = 32 total cells in By Category

    // Total should be 64 cells
    const cells = screen.getAllByRole("cell");
    expect(cells.length).toBe(64);
  });

  it("renders with empty history", () => {
    (useStorage as jest.Mock).mockReturnValue({
      history: [],
    });

    render(<RatingsPage />);

    // Should still render the page structure without errors
    expect(screen.getByText("Ratings Summary")).toBeInTheDocument();
    expect(screen.getByText("By Model")).toBeInTheDocument();
    expect(screen.getByText("By Category")).toBeInTheDocument();

    // But should not have any table rows for history items
    const cells = screen.queryAllByRole("cell");
    expect(cells.length).toBe(0);
  });
});
