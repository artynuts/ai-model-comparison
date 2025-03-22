import { render, screen, fireEvent } from "@testing-library/react";
import ThumbsRating from "../ThumbsRating";
import { RATING_CATEGORIES, ResponseRating } from "../../types";

describe("ThumbsRating", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  it("renders with default props and all categories", () => {
    render(<ThumbsRating onChange={mockOnChange} />);

    // Check that all category labels are rendered
    RATING_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.label)).toBeInTheDocument();
    });

    // Default text should be "Not rated"
    expect(screen.getByText("Not rated")).toBeInTheDocument();
  });

  it("renders with showLabel=false", () => {
    render(<ThumbsRating onChange={mockOnChange} showLabel={false} />);

    // The "Rate this response:" text should not be present
    expect(screen.queryByText("Rate this response:")).not.toBeInTheDocument();

    // But the rating categories should still be there
    expect(screen.getByText(RATING_CATEGORIES[0].label)).toBeInTheDocument();
  });

  it("renders with showAverage=false", () => {
    render(<ThumbsRating onChange={mockOnChange} showAverage={false} />);

    // The "Not rated" badge should not be present
    expect(screen.queryByText("Not rated")).not.toBeInTheDocument();

    // But the rating categories should still be there
    expect(screen.getByText(RATING_CATEGORIES[0].label)).toBeInTheDocument();
  });

  it("calls onChange with updated rating when thumbs up is clicked", () => {
    render(<ThumbsRating onChange={mockOnChange} />);

    // Find the thumbs up button for the first category
    const thumbsUpButtons = screen.getAllByTitle("Thumbs up");
    fireEvent.click(thumbsUpButtons[0]);

    // Check that onChange was called with the right argument
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        [RATING_CATEGORIES[0].key]: true,
      })
    );
  });

  it("calls onChange with updated rating when thumbs down is clicked", () => {
    render(<ThumbsRating onChange={mockOnChange} />);

    // Find the thumbs down button for the second category
    const thumbsDownButtons = screen.getAllByTitle("Thumbs down");
    fireEvent.click(thumbsDownButtons[1]);

    // Check that onChange was called with the right argument
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        [RATING_CATEGORIES[1].key]: false,
      })
    );
  });

  it("displays the correct average rating with positive ratings", () => {
    // Create a mock rating with 2 positive, 1 negative, 2 nulls
    const mockRating: ResponseRating = {
      accuracy: true,
      relevance: true,
      completeness: false,
      concise: null,
      unbiased: null,
    };

    render(<ThumbsRating rating={mockRating} onChange={mockOnChange} />);

    // Average should be 67% (2/3)
    expect(screen.getByText("67% positive")).toBeInTheDocument();
  });

  it("displays rating styles based on percentage", () => {
    // Create ratings for different percentages
    const highRating: ResponseRating = {
      accuracy: true,
      relevance: true,
      completeness: true,
      concise: true,
      unbiased: false,
    };

    const { rerender } = render(
      <ThumbsRating rating={highRating} onChange={mockOnChange} />
    );

    // High rating (80%) should have green styling
    const highRatingElement = screen.getByText("80% positive");
    expect(highRatingElement).toHaveClass("bg-green-100", "text-green-700");

    // Medium rating (50%) should have yellow styling
    const mediumRating: ResponseRating = {
      accuracy: true,
      relevance: false,
      completeness: true,
      concise: false,
      unbiased: null,
    };

    rerender(<ThumbsRating rating={mediumRating} onChange={mockOnChange} />);
    const mediumRatingElement = screen.getByText("50% positive");
    expect(mediumRatingElement).toHaveClass("bg-yellow-100", "text-yellow-700");

    // Low rating (20%) should have red styling
    const lowRating: ResponseRating = {
      accuracy: false,
      relevance: false,
      completeness: false,
      concise: true,
      unbiased: null,
    };

    rerender(<ThumbsRating rating={lowRating} onChange={mockOnChange} />);
    const lowRatingElement = screen.getByText("25% positive");
    expect(lowRatingElement).toHaveClass("bg-red-100", "text-red-700");
  });
});
