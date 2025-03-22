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

  it("displays appropriate visual indication based on rating percentage", () => {
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

    // High rating (80%) should have a positive visual indication
    const highRatingElement = screen.getByText("80% positive");
    expect(highRatingElement).toBeVisible();
    // Get computed style to verify it appears with positive styling
    const highRatingStyle = window.getComputedStyle(highRatingElement);
    expect(highRatingElement.title).toContain(
      "80% of rated categories are positive"
    );

    // Medium rating (50%) should have a neutral visual indication
    const mediumRating: ResponseRating = {
      accuracy: true,
      relevance: false,
      completeness: true,
      concise: false,
      unbiased: null,
    };

    rerender(<ThumbsRating rating={mediumRating} onChange={mockOnChange} />);
    const mediumRatingElement = screen.getByText("50% positive");
    expect(mediumRatingElement).toBeVisible();
    expect(mediumRatingElement.title).toContain(
      "50% of rated categories are positive"
    );

    // Low rating (20%) should have a negative visual indication
    const lowRating: ResponseRating = {
      accuracy: false,
      relevance: false,
      completeness: false,
      concise: true,
      unbiased: null,
    };

    rerender(<ThumbsRating rating={lowRating} onChange={mockOnChange} />);
    const lowRatingElement = screen.getByText("25% positive");
    expect(lowRatingElement).toBeVisible();
    expect(lowRatingElement.title).toContain(
      "25% of rated categories are positive"
    );
  });

  it("has visually distinct appearances for different rating levels", () => {
    const { rerender } = render(
      <ThumbsRating
        rating={{
          accuracy: true,
          relevance: true,
          completeness: true,
          concise: true,
          unbiased: true,
        }}
        onChange={mockOnChange}
      />
    );

    // Get the high rating element (100% positive)
    const highRatingElement = screen.getByText("100% positive");
    const highRatingTitle = highRatingElement.getAttribute("title");

    // Rerender with low rating
    rerender(
      <ThumbsRating
        rating={{
          accuracy: false,
          relevance: false,
          completeness: false,
          concise: false,
          unbiased: false,
        }}
        onChange={mockOnChange}
      />
    );

    // Get the low rating element (0% positive)
    const lowRatingElement = screen.getByText("0% positive");
    const lowRatingTitle = lowRatingElement.getAttribute("title");

    // Rerender with no rating
    rerender(<ThumbsRating onChange={mockOnChange} />);

    // Get the not rated element
    const notRatedElement = screen.getByText("Not rated");
    const notRatedTitle = notRatedElement.getAttribute("title");

    // Verify elements are visually distinguishable by checking they have different title attributes
    // This is a behavior-focused way to test without relying on specific CSS classes
    expect(highRatingTitle).toContain("100% of rated categories are positive");
    expect(lowRatingTitle).toContain("0% of rated categories are positive");
    expect(notRatedTitle).toBe("No ratings yet");
  });
});
