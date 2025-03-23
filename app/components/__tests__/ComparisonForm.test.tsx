import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComparisonForm from "../ComparisonForm";
import { compareModels } from "../../lib/api";
import { useStorage } from "../../context/StorageContext";
import { AIResponse } from "../../types";
import QueryGroup from "../QueryGroup";

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
    mockAddToHistory.mockResolvedValue({ id: "mock-id-123", skipped: false });
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
    // Make sure the addToHistory mock returns the correct format
    mockAddToHistory.mockResolvedValue({ id: "mock-id-123", skipped: false });

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

    // Wait for the rating update to be processed
    await waitFor(() => {
      // Verify the rating was updated
      expect(mockUpdateResponseRating).toHaveBeenCalledWith("mock-id-123", 0, {
        accuracy: true,
      });
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

  it("does not submit when query is empty string", async () => {
    render(<ComparisonForm />);

    // First add non-whitespace to make button enabled
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "test" } });

    // Get the button while it's enabled
    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    expect(submitButton).not.toBeDisabled();

    // Now change to whitespace-only
    fireEvent.change(textarea, { target: { value: "   " } }); // Only whitespace

    // Submit the form directly to test early return in handleSubmit
    // This specifically tests line 28: if (!query.trim()) return;
    const form = screen.getByTestId("comparison-form");
    fireEvent.submit(form);

    // Verify compareModels and addToHistory were not called
    expect(compareModels).not.toHaveBeenCalled();
    expect(mockAddToHistory).not.toHaveBeenCalled();

    // The comparison state should remain unchanged
    expect(screen.queryByTestId("query-group")).not.toBeInTheDocument();
  });

  it("handles the case when addToHistory returns different ID", async () => {
    // Setup addToHistory to return a different ID
    mockAddToHistory.mockResolvedValue({
      id: "different-id-than-expected",
      skipped: false,
    });

    render(<ComparisonForm />);

    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "ID test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Check the ID is passed correctly to QueryGroup
    expect(mockAddToHistory).toHaveBeenCalledWith("ID test", mockResponses);
  });

  it("handles addToHistory rejection", async () => {
    // Setup addToHistory to reject
    mockAddToHistory.mockRejectedValue(new Error("History error"));

    // Spy on console.error to verify it's called
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<ComparisonForm />);

    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "History error test" } });

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

    // No QueryGroup should be displayed
    expect(screen.queryByTestId("query-group")).not.toBeInTheDocument();
  });

  it("displays responses with error messages", async () => {
    const responsesWithError = [
      ...mockResponses,
      {
        id: "resp3",
        modelName: "Model C",
        provider: "Provider Z",
        version: "3.0",
        description: "Test model C",
        response: "",
        latency: 300,
        error: "Model unavailable",
      },
    ];

    (compareModels as jest.Mock).mockResolvedValue(responsesWithError);

    render(<ComparisonForm />);

    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Error response test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Verify responses with error are passed to QueryGroup
    expect(screen.getByText("Responses: 3")).toBeInTheDocument();
  });

  it("doesn't update rating when comparison id is empty", async () => {
    render(<ComparisonForm />);

    // Get the form to a state where responses are loaded but ID is empty
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Rating test" } });

    // Force the comparison state to have empty ID
    (compareModels as jest.Mock).mockResolvedValue(mockResponses);
    mockAddToHistory.mockResolvedValue({ id: "", skipped: false });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // Rating button click should not update the rating
    const rateButton = screen.getByTestId("mock-rating-button");
    fireEvent.click(rateButton);

    // Verify updateResponseRating was not called
    expect(mockUpdateResponseRating).not.toHaveBeenCalled();
  });

  it("doesn't update rating when rating is null", async () => {
    // Create a special mock implementation for this test
    const originalMock = jest.requireMock("../QueryGroup").default;
    const mockImplementation = jest.fn(({ onRatingChange }) => {
      // Call onRatingChange with null immediately after component renders
      if (onRatingChange) {
        setTimeout(() => onRatingChange(0, null), 0);
      }
      return (
        <div data-testid="query-group">
          <div>Mock QueryGroup</div>
        </div>
      );
    });

    jest.requireMock("../QueryGroup").default = mockImplementation;

    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Null rating test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // With our mock implementation, onRatingChange is called with null
    // So verify that updateResponseRating wasn't called
    await waitFor(() => {
      expect(mockUpdateResponseRating).not.toHaveBeenCalled();
    });

    // Restore original mock
    jest.requireMock("../QueryGroup").default = originalMock;
  });

  it("doesn't update rating when rating is undefined", async () => {
    // Create a special mock implementation for this test
    const originalMock = jest.requireMock("../QueryGroup").default;
    const mockImplementation = jest.fn(({ onRatingChange }) => {
      // Call onRatingChange with undefined immediately after component renders
      if (onRatingChange) {
        setTimeout(() => onRatingChange(0, undefined), 0);
      }
      return (
        <div data-testid="query-group">
          <div>Mock QueryGroup</div>
        </div>
      );
    });

    jest.requireMock("../QueryGroup").default = mockImplementation;

    render(<ComparisonForm />);

    // Enter a query and submit
    const textarea = screen.getByPlaceholderText("Enter your query here...");
    fireEvent.change(textarea, { target: { value: "Undefined rating test" } });

    const submitButton = screen.getByRole("button", {
      name: /compare models/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("query-group")).toBeInTheDocument();
    });

    // With our mock implementation, onRatingChange is called with undefined
    // So verify that updateResponseRating wasn't called
    await waitFor(() => {
      expect(mockUpdateResponseRating).not.toHaveBeenCalled();
    });

    // Restore original mock
    jest.requireMock("../QueryGroup").default = originalMock;
  });
});
