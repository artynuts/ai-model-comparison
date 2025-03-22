import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComparisonForm from "../ComparisonForm";
import { compareModels } from "../../lib/api";
import { useStorage } from "../../context/StorageContext";
import { AIResponse } from "../../types";

// Mock dependencies
jest.mock("../../lib/api", () => ({
  compareModels: jest.fn(),
}));

jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

// Mock the QueryGroup component
jest.mock("../QueryGroup", () => {
  return {
    __esModule: true,
    default: ({ query, timestamp, responses, onRatingChange }: any) => (
      <div data-testid="query-group">
        <div>Query: {query}</div>
        <div>Responses: {responses.length}</div>
        {onRatingChange && (
          <button
            data-testid="mock-rating-button"
            onClick={() => onRatingChange(0, { accuracy: true })}
          >
            Rate First Response
          </button>
        )}
      </div>
    ),
  };
});

describe("ComparisonForm", () => {
  const mockAddToHistory = jest.fn();
  const mockUpdateResponseRating = jest.fn();
  const mockResponses: AIResponse[] = [
    {
      id: "resp1",
      modelName: "Model A",
      provider: "Provider X",
      version: "1.0",
      description: "Test model A",
      response: "Response from Model A",
      latency: 100,
    },
    {
      id: "resp2",
      modelName: "Model B",
      provider: "Provider Y",
      version: "2.0",
      description: "Test model B",
      response: "Response from Model B",
      latency: 200,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      addToHistory: mockAddToHistory,
      updateResponseRating: mockUpdateResponseRating,
    });
    mockAddToHistory.mockResolvedValue("mock-id-123");
    (compareModels as jest.Mock).mockResolvedValue(mockResponses);
  });

  it("allows users to enter a query in the textarea", () => {
    render(<ComparisonForm />);

    const textarea = screen.getByPlaceholderText("Enter your query here...");
    expect(textarea).toBeVisible();

    fireEvent.change(textarea, {
      target: { value: "What is the meaning of life?" },
    });
    expect(textarea).toHaveValue("What is the meaning of life?");
  });

  it("disables the submit button when query is empty", () => {
    render(<ComparisonForm />);

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "A query" } });

    expect(submitButton).not.toBeDisabled();
  });

  it("shows loading state while fetching responses", async () => {
    // Set up compareModels to delay before resolving
    (compareModels as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockResponses), 100);
      });
    });

    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "A test query" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    // Button should show loading state
    expect(
      screen.getByRole("button", { name: /comparing.../i })
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for the responses to load
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /compare models/i })
      ).toBeInTheDocument();
    });
  });

  it("displays model responses after successful comparison", async () => {
    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "What is AI?" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    // Wait for the QueryGroup to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Verify the query is passed to QueryGroup
    expect(screen.getByText("Query: What is AI?")).toBeInTheDocument();

    // Verify responses are passed to QueryGroup
    expect(screen.getByText("Responses: 2")).toBeInTheDocument();
  });

  it("allows users to rate responses", async () => {
    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Rate this response" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    // Wait for the QueryGroup to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Rate the first response
    const rateButton = screen.getByTestId("mock-rating-button");
    fireEvent.click(rateButton);

    // Verify the rating was updated
    expect(mockUpdateResponseRating).toHaveBeenCalledWith("mock-id-123", 0, {
      accuracy: true,
    });
  });

  it("handles API errors gracefully", async () => {
    // Set up compareModels to throw an error
    (compareModels as jest.Mock).mockRejectedValue(new Error("API error"));

    // Spy on console.error to verify it's called
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Error test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Comparison failed:",
        expect.any(Error)
      );
    });

    // Button should return to normal state
    expect(
      screen.getByRole("button", { name: /compare models/i })
    ).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // No QueryGroup should be displayed
    expect(screen.queryByTestId("query-group")).not.toBeInTheDocument();
  });

  it("saves comparison results to history", async () => {
    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "History test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    // Wait for the responses to load
    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Verify history was updated
    expect(mockAddToHistory).toHaveBeenCalledWith(
      "History test",
      mockResponses
    );
  });
});
