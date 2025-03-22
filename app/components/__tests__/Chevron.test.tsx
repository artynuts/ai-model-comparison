import { render, screen } from "@testing-library/react";
import Chevron from "../Chevron";

describe("Chevron", () => {
  it("renders a visible icon by default", () => {
    render(<Chevron />);
    // Use a more accessible way to find the element
    const chevronElement = screen.getByTestId("chevron-icon");
    expect(chevronElement).toBeVisible();
  });

  it("points down by default", () => {
    render(<Chevron />);
    const chevronElement = screen.getByTestId("chevron-icon");

    // Test the visual orientation based on aria attributes
    expect(chevronElement).toHaveAttribute(
      "aria-label",
      "chevron pointing down"
    );
  });

  it("points up when direction is set to 'up'", () => {
    render(<Chevron direction="up" />);
    const chevronElement = screen.getByTestId("chevron-icon");

    // Test the visual orientation based on aria attributes
    expect(chevronElement).toHaveAttribute("aria-label", "chevron pointing up");
  });

  it("can be styled with custom classes for different visual presentations", () => {
    // This is a behavior test because it's about the component's ability to accept styling
    // variations, which is a core feature of the component
    const { rerender } = render(<Chevron className="test-custom-styling" />);

    // Verify the component can accept custom styling
    const chevronElement = screen.getByTestId("chevron-icon");
    expect(chevronElement).toHaveClass("test-custom-styling");

    // Verify the component can accept different styling
    rerender(<Chevron className="different-custom-styling" />);
    expect(chevronElement).toHaveClass("different-custom-styling");
  });

  it("has different visual presentations for up and down directions", () => {
    const { rerender } = render(<Chevron direction="down" />);
    const chevronElement = screen.getByTestId("chevron-icon");

    // Store the initial presentation
    const initialPresentation = chevronElement.outerHTML;

    // Change the direction and verify the presentation changes
    rerender(<Chevron direction="up" />);
    const updatedPresentation = chevronElement.outerHTML;

    // The visual presentation should be different when direction changes
    expect(updatedPresentation).not.toEqual(initialPresentation);
  });
});
