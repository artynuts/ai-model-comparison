import { render, screen, fireEvent } from "@testing-library/react";
import QueryGroup from "../QueryGroup";
import { AIResponse } from "../../types";

// Mock the child components
jest.mock("../QueryResponseCard", () => {
  return {
    __esModule: true,
    default: ({ response, onRatingChange, variant }: any) => (
      <div data-testid="query-response-card" data-variant={variant}>
        <div>{response.modelName}</div>
        {onRatingChange && (
          <button
            data-testid="mock-rating-button"
            onClick={() => onRatingChange({ accuracy: true })}
          >
            Rate
          </button>
        )}
      </div>
    ),
  };
});

jest.mock("../DeleteButton", () => {
  return {
    __esModule: true,
    default: ({ onDelete, className }: any) => (
      <button
        data-testid="delete-button"
        onClick={onDelete}
        className={className}
      >
        Delete
      </button>
    ),
  };
});

describe("QueryGroup", () => {
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

  const mockTimestamp = 1625097600000; // July 1, 2021
  const mockQuery = "What's the weather like?";
  const mockOnDelete = jest.fn();
  const mockOnRatingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the query text to users", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
      />
    );

    expect(screen.getByText(mockQuery)).toBeVisible();
  });

  it("shows the timestamp in a user-friendly format", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
      />
    );

    // This format may vary depending on the user's locale
    // We're checking for the date being visible in some format
    const date = new Date(mockTimestamp).toLocaleString();
    expect(screen.getByText(date)).toBeVisible();
  });

  it("displays all model responses", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
      />
    );

    // Check that both model names are displayed
    expect(screen.getByText("Model A")).toBeInTheDocument();
    expect(screen.getByText("Model B")).toBeInTheDocument();

    // Check that we have the expected number of response cards
    const responseCards = screen.getAllByTestId("query-response-card");
    expect(responseCards).toHaveLength(2);
  });

  it("allows users to delete the query group when deletion is enabled", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
        onDelete={mockOnDelete}
      />
    );

    // Verify delete button is visible
    const deleteButton = screen.getByTestId("delete-button");
    expect(deleteButton).toBeVisible();

    // Verify delete action works
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("does not show delete option when deletion is not enabled", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
      />
    );

    // Verify delete button is not present
    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
  });

  it("allows users to rate responses when rating is enabled", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
        onRatingChange={mockOnRatingChange}
      />
    );

    // Verify rating buttons are visible
    const ratingButtons = screen.getAllByTestId("mock-rating-button");
    expect(ratingButtons).toHaveLength(2);

    // Rate the first response
    fireEvent.click(ratingButtons[0]);

    // Verify the correct handler was called with the right index and rating
    expect(mockOnRatingChange).toHaveBeenCalledWith(0, { accuracy: true });
  });

  it("shows a visual indicator when the query group is selected", () => {
    const { container, rerender } = render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
      />
    );

    // Get the initial state appearance
    const initialHTML = container.innerHTML;

    // Rerender with isSelected=true
    rerender(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
        isSelected={true}
      />
    );

    // Get the selected state appearance
    const selectedHTML = container.innerHTML;

    // Verify visual appearance has changed without checking specific classes
    expect(selectedHTML).not.toEqual(initialHTML);

    // Verify the query text is still visible
    expect(screen.getByText(mockQuery)).toBeVisible();
  });

  it("displays responses using the specified variant", () => {
    render(
      <QueryGroup
        query={mockQuery}
        timestamp={mockTimestamp}
        responses={mockResponses}
        variant="compact"
      />
    );

    // Check that the variant is passed to the response cards
    const responseCards = screen.getAllByTestId("query-response-card");
    responseCards.forEach((card) => {
      expect(card).toHaveAttribute("data-variant", "compact");
    });
  });
});
