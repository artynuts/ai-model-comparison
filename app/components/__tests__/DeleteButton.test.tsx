import { render, screen, fireEvent } from "@testing-library/react";
import DeleteButton from "../DeleteButton";

describe("DeleteButton", () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
    // Mock window.confirm
    window.confirm = jest.fn();
  });

  it("renders the delete button", () => {
    render(<DeleteButton onDelete={mockOnDelete} />);

    const button = screen.getByRole("button", { name: /delete query/i });
    expect(button).toBeInTheDocument();
  });

  it("applies the correct base classes", () => {
    render(<DeleteButton onDelete={mockOnDelete} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-colors");
    expect(button).toHaveClass("p-1");
    expect(button).toHaveClass("hover:text-red-600");
  });

  it("applies the correct size class for default size (md)", () => {
    render(<DeleteButton onDelete={mockOnDelete} />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toHaveClass("h-5");
    expect(svg).toHaveClass("w-5");
  });

  it("applies the correct size class for small size", () => {
    render(<DeleteButton onDelete={mockOnDelete} size="sm" />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toHaveClass("h-4");
    expect(svg).toHaveClass("w-4");
  });

  it("applies the showOnHover class when showOnHover is true", () => {
    render(<DeleteButton onDelete={mockOnDelete} showOnHover={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-0");
    expect(button).toHaveClass("group-hover:opacity-100");
    expect(button).toHaveClass("transition-opacity");
  });

  it("applies additional class names from className prop", () => {
    render(<DeleteButton onDelete={mockOnDelete} className="test-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("test-class");
  });

  it("shows confirmation dialog when clicked", () => {
    render(<DeleteButton onDelete={mockOnDelete} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this query?"
    );
  });

  it("calls onDelete when confirmed", () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(<DeleteButton onDelete={mockOnDelete} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("does not call onDelete when confirmation is canceled", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<DeleteButton onDelete={mockOnDelete} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("prevents navigation when used within a link", () => {
    // Store the original location
    const originalLocation = window.location;

    // Create a mock location object
    const mockLocation = { href: "http://original-url.com" } as Location;

    // Replace window.location with our mock
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });

    // Return true for confirm to ensure the event flow continues
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Render the delete button inside a link
    render(
      <a href="http://different-url.com" data-testid="parent-link">
        Test Link
        <DeleteButton onDelete={mockOnDelete} />
      </a>
    );

    // Find and click the delete button
    const button = screen.getByRole("button", { name: /delete query/i });
    fireEvent.click(button);

    // Check that:
    // 1. The onDelete function was called (confirmation was accepted)
    // 2. The URL did not change (navigation was prevented)
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("http://original-url.com");

    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });
});
