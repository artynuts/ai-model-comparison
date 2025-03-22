import { render, screen } from "@testing-library/react";
import QueryResponseCard from "../QueryResponseCard";
import { AIResponse } from "../../types";

// Mock the child components
jest.mock("../MarkdownResponse", () => {
  return {
    __esModule: true,
    default: ({ content }: { content: string }) => (
      <div data-testid="markdown-response">{content}</div>
    ),
  };
});

jest.mock("../ThumbsRating", () => {
  return {
    __esModule: true,
    default: ({ rating, onChange }: any) => (
      <div data-testid="thumbs-rating">Thumbs Rating Component</div>
    ),
  };
});

describe("QueryResponseCard", () => {
  const mockResponse: AIResponse = {
    modelName: "Model X",
    id: "123",
    provider: "Provider A",
    version: "1.0.0",
    description: "A test model",
    response: "This is a test response",
    latency: 500,
  };

  const mockOnRatingChange = jest.fn();

  it("displays model information to the user", () => {
    render(<QueryResponseCard response={mockResponse} />);

    // Verify the key information that users would see is displayed
    expect(screen.getByText("Model X")).toBeInTheDocument();
    expect(screen.getByText("Provider A")).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByText("A test model")).toBeInTheDocument();
    expect(screen.getByText("Latency: 500ms")).toBeInTheDocument();
  });

  it("shows the AI response content to the user", () => {
    render(<QueryResponseCard response={mockResponse} />);

    // Verify the response content is visible to the user
    const responseContent = screen.getByText("This is a test response");
    expect(responseContent).toBeVisible();
  });

  it("includes rating functionality when enabled", () => {
    render(
      <QueryResponseCard
        response={mockResponse}
        onRatingChange={mockOnRatingChange}
      />
    );

    // Verify rating component is available for user interaction
    expect(screen.getByTestId("thumbs-rating")).toBeVisible();
  });

  it("excludes rating functionality when not enabled", () => {
    render(<QueryResponseCard response={mockResponse} />);

    // Verify rating component is not shown when feature is disabled
    expect(screen.queryByTestId("thumbs-rating")).not.toBeInTheDocument();
  });

  it("shows error message when AI response has failed", () => {
    const errorResponse = {
      ...mockResponse,
      error: "Something went wrong",
    };

    render(<QueryResponseCard response={errorResponse} />);

    // Verify error message is displayed to the user
    expect(screen.getByText("Something went wrong")).toBeVisible();

    // Verify regular response content is not shown during errors
    expect(screen.queryByTestId("markdown-response")).not.toBeInTheDocument();
  });

  it("provides a compact view with less detailed information", () => {
    render(<QueryResponseCard response={mockResponse} variant="compact" />);

    // Verify compact view hides certain less important details
    expect(screen.queryByText("1.0.0")).not.toBeInTheDocument();
    expect(screen.queryByText("A test model")).not.toBeInTheDocument();

    // Verify essential information remains visible in compact view
    expect(screen.getByText("Model X")).toBeVisible();
    expect(screen.getByText("Provider A")).toBeVisible();

    // Verify response content is still shown in compact view
    expect(screen.getByText("This is a test response")).toBeVisible();
  });
});
