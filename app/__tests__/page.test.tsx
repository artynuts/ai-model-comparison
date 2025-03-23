import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../page";

// Mock the ComparisonForm component
jest.mock("../components/ComparisonForm", () => {
  return function MockComparisonForm() {
    return <div data-testid="comparison-form">Comparison Form</div>;
  };
});

describe("Home Page", () => {
  it("renders the comparison form", () => {
    const { getByTestId } = render(<Home />);

    // Check that the ComparisonForm is rendered
    const formComponent = getByTestId("comparison-form");
    expect(formComponent).toBeInTheDocument();
    expect(formComponent).toHaveTextContent("Comparison Form");
  });

  it("wraps the comparison form in a container with proper padding", () => {
    const { getByTestId } = render(<Home />);

    // Check the page structure and styling
    const formComponent = getByTestId("comparison-form");
    const container = formComponent.closest("div.p-8");
    expect(container).toBeInTheDocument();
  });
});
