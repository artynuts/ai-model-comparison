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

  it("renders model information correctly", () => {
    render(<QueryResponseCard response={mockResponse} />);

    expect(screen.getByText("Model X")).toBeInTheDocument();
    expect(screen.getByText("Provider A")).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByText("A test model")).toBeInTheDocument();
    expect(screen.getByText("Latency: 500ms")).toBeInTheDocument();
  });

  it("renders the response content in the MarkdownResponse component", () => {
    render(<QueryResponseCard response={mockResponse} />);

    const markdownResponse = screen.getByTestId("markdown-response");
    expect(markdownResponse).toBeInTheDocument();
    expect(markdownResponse.textContent).toBe("This is a test response");
  });

  it("renders ThumbsRating when onRatingChange is provided", () => {
    render(
      <QueryResponseCard
        response={mockResponse}
        onRatingChange={mockOnRatingChange}
      />
    );

    expect(screen.getByTestId("thumbs-rating")).toBeInTheDocument();
  });

  it("does not render ThumbsRating when onRatingChange is not provided", () => {
    render(<QueryResponseCard response={mockResponse} />);

    expect(screen.queryByTestId("thumbs-rating")).not.toBeInTheDocument();
  });

  it("renders error message when response has an error", () => {
    const errorResponse = {
      ...mockResponse,
      error: "Something went wrong",
    };

    render(<QueryResponseCard response={errorResponse} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByTestId("markdown-response")).not.toBeInTheDocument();
  });

  it("renders in compact variant correctly", () => {
    render(<QueryResponseCard response={mockResponse} variant="compact" />);

    // In compact mode, version and description should not be shown
    expect(screen.queryByText("1.0.0")).not.toBeInTheDocument();
    expect(screen.queryByText("A test model")).not.toBeInTheDocument();

    // But model name and provider should still be visible
    expect(screen.getByText("Model X")).toBeInTheDocument();
    expect(screen.getByText("Provider A")).toBeInTheDocument();
  });
});
