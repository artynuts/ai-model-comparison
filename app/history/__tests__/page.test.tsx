import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import History from "../page";
import { AIResponse } from "@/app/types";

// Mock the useSearchParams hook
const mockSearchParamsGet = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

// Mock the QueryGroup component
jest.mock("@/app/components/QueryGroup", () => {
  return function MockQueryGroup({
    query,
    id,
    onDelete,
    onRatingChange,
    isSelected,
    variant,
  }: {
    query: string;
    id: string;
    onDelete: () => void;
    onRatingChange: (index: number, rating: any) => void;
    isSelected: boolean;
    variant: string;
  }) {
    return (
      <div
        data-testid={`query-group-${id}`}
        className={isSelected ? "selected" : ""}
      >
        <div data-testid="query-text">{query}</div>
        <div data-testid="variant">{variant}</div>
        <button data-testid={`delete-btn-${id}`} onClick={onDelete}>
          Delete
        </button>
        <button
          data-testid={`rate-btn-${id}`}
          onClick={() => onRatingChange(0, { accuracy: true })}
        >
          Rate
        </button>
      </div>
    );
  };
});

// Mock the useStorage hook
const mockDeleteFromHistory = jest.fn();
const mockUpdateResponseRating = jest.fn();
const mockHistory = [
  {
    id: "1",
    query: "Test query 1",
    timestamp: 1630000000000,
    responses: [
      {
        modelName: "GPT-4",
        id: "gpt-1",
        provider: "OpenAI",
        version: "4.0",
        description: "Advanced language model",
        response: "GPT-4 response",
        latency: 100,
      },
    ] as AIResponse[],
  },
  {
    id: "2",
    query: "Test query 2",
    timestamp: 1630000001000,
    responses: [
      {
        modelName: "Claude",
        id: "claude-1",
        provider: "Anthropic",
        version: "3.0",
        description: "Helpful assistant",
        response: "Claude response",
        latency: 200,
      },
    ] as AIResponse[],
  },
];

jest.mock("@/app/context/StorageContext", () => ({
  useStorage: () => ({
    history: mockHistory,
    deleteFromHistory: mockDeleteFromHistory,
    updateResponseRating: mockUpdateResponseRating,
  }),
}));

// Mock the scrollIntoView method
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe("History Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchParamsGet.mockImplementation((param) => {
      if (param === "query") return null;
      return null;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the history page title", () => {
    render(<History />);
    expect(screen.getByText("Query History")).toBeInTheDocument();
  });

  it("renders all history items", () => {
    render(<History />);

    expect(screen.getByTestId("query-group-1")).toBeInTheDocument();
    expect(screen.getByTestId("query-group-2")).toBeInTheDocument();

    expect(screen.getAllByTestId("query-text")[0]).toHaveTextContent(
      "Test query 1"
    );
    expect(screen.getAllByTestId("query-text")[1]).toHaveTextContent(
      "Test query 2"
    );
  });

  it("renders each query group with compact variant", () => {
    render(<History />);

    const variants = screen.getAllByTestId("variant");
    expect(variants.length).toBe(2);
    expect(variants[0]).toHaveTextContent("compact");
    expect(variants[1]).toHaveTextContent("compact");
  });

  it("handles delete action for a history item", () => {
    render(<History />);

    const deleteButton = screen.getByTestId("delete-btn-1");
    fireEvent.click(deleteButton);

    expect(mockDeleteFromHistory).toHaveBeenCalledWith("1");
  });

  it("handles rating change for a history item", () => {
    render(<History />);

    const rateButton = screen.getByTestId("rate-btn-1");
    fireEvent.click(rateButton);

    expect(mockUpdateResponseRating).toHaveBeenCalledWith("1", 0, {
      accuracy: true,
    });
  });

  it("selects and scrolls to a query when URL parameter is set", () => {
    // Mock the search params to return a selected query
    mockSearchParamsGet.mockImplementation((param) => {
      if (param === "query") return "Test query 1";
      return null;
    });

    render(<History />);

    // Check that the correct item is marked as selected
    const queryGroup = screen.getByTestId("query-group-1");
    expect(queryGroup).toHaveClass("selected");

    // Advance timers to trigger the scrollIntoView
    jest.advanceTimersByTime(100);

    // Check that scrollIntoView was called
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("doesn't call scrollIntoView when no query is selected", () => {
    render(<History />);

    // Advance timers
    jest.advanceTimersByTime(100);

    // Check that scrollIntoView was not called
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
