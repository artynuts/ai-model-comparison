import { render, screen, fireEvent } from "@testing-library/react";
import CollapsibleSection from "../CollapsibleSection";

describe("CollapsibleSection", () => {
  it("renders children and is expanded by default", () => {
    render(
      <CollapsibleSection>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Hide Details")).toBeInTheDocument();

    // Check that content is visible (max-height not 0)
    const contentContainer = screen.getByTestId("test-content").parentElement;
    expect(contentContainer).toHaveClass("max-h-96");
    expect(contentContainer).not.toHaveClass("max-h-0");
  });

  it("can be initialized as closed", () => {
    render(
      <CollapsibleSection isOpen={false}>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText("Show Details")).toBeInTheDocument();

    // Check that content is hidden (max-height is 0)
    const contentContainer = screen.getByTestId("test-content").parentElement;
    expect(contentContainer).toHaveClass("max-h-0");
    expect(contentContainer).not.toHaveClass("max-h-96");
  });

  it("toggles between expanded and collapsed when button is clicked", () => {
    render(
      <CollapsibleSection>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    // Initially expanded
    expect(screen.getByText("Hide Details")).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText("Hide Details"));

    // Should now be collapsed
    expect(screen.getByText("Show Details")).toBeInTheDocument();
    const contentContainer = screen.getByTestId("test-content").parentElement;
    expect(contentContainer).toHaveClass("max-h-0");

    // Click to expand again
    fireEvent.click(screen.getByText("Show Details"));

    // Should now be expanded again
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
    expect(contentContainer).toHaveClass("max-h-96");
  });

  it("renders the Chevron component with correct rotation", () => {
    const { container } = render(
      <CollapsibleSection>
        <div>Test Content</div>
      </CollapsibleSection>
    );

    // When expanded, the Chevron container should have rotate-180 class
    const chevronContainer = container.querySelector("button > div");
    expect(chevronContainer).toHaveClass("rotate-180");

    // Collapse the section
    fireEvent.click(screen.getByText("Hide Details"));

    // When collapsed, the Chevron container should not have rotate-180 class
    expect(chevronContainer).not.toHaveClass("rotate-180");
  });
});
