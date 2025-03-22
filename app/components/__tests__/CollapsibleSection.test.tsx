import { render, screen, fireEvent } from "@testing-library/react";
import CollapsibleSection from "../CollapsibleSection";

describe("CollapsibleSection", () => {
  it("renders children and is expanded by default", () => {
    render(
      <CollapsibleSection>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    // Verify content is visible by default
    expect(screen.getByTestId("test-content")).toBeVisible();

    // Verify the button shows the correct state
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
  });

  it("can be initialized as closed", () => {
    render(
      <CollapsibleSection isOpen={false}>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    // Verify button shows correct state when closed
    expect(screen.getByText("Show Details")).toBeInTheDocument();
    expect(screen.queryByText("Hide Details")).not.toBeInTheDocument();

    // In a real browser, this element would not be visible
    // but in JSDOM we can only verify it's in the document
    const testContent = screen.getByTestId("test-content");
    expect(testContent).toBeInTheDocument();
  });

  it("toggles between expanded and collapsed when button is clicked", () => {
    render(
      <CollapsibleSection>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    // Verify initially expanded state
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeVisible();

    // Click to collapse
    fireEvent.click(screen.getByText("Hide Details"));

    // Verify collapsed state
    expect(screen.getByText("Show Details")).toBeInTheDocument();
    expect(screen.queryByText("Hide Details")).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByText("Show Details"));

    // Verify expanded state again
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
    expect(screen.queryByText("Show Details")).not.toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeVisible();
  });

  it("displays an indicator that changes when toggling expanded/collapsed state", () => {
    const { container } = render(
      <CollapsibleSection>
        <div data-testid="test-content">Test Content</div>
      </CollapsibleSection>
    );

    // Get the button that toggles the section
    const toggleButton = screen.getByRole("button");

    // Verify initial expanded state shows appropriate text
    expect(toggleButton).toHaveTextContent("Hide Details");

    // Check for visual indicator (the container of the chevron changes appearance)
    const chevronContainer = container.querySelector("button > div");
    expect(chevronContainer).not.toBeNull();

    // Get the initial state of the container
    const initialContainerHTML = chevronContainer?.outerHTML;

    // Collapse the section
    fireEvent.click(toggleButton);

    // Verify the button text has changed
    expect(toggleButton).toHaveTextContent("Show Details");

    // Verify the container's appearance has changed
    const collapsedContainerHTML = chevronContainer?.outerHTML;
    expect(collapsedContainerHTML).not.toEqual(initialContainerHTML);
  });
});
