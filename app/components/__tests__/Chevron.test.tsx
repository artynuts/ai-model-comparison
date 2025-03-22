import { render } from "@testing-library/react";
import Chevron from "../Chevron";

describe("Chevron", () => {
  it("renders with default props", () => {
    const { container } = render(<Chevron />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Should not have rotate class when default direction is down
    expect(svg).not.toHaveClass("rotate-180");
  });

  it("applies rotate class when direction is 'up'", () => {
    const { container } = render(<Chevron direction="up" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("rotate-180");
  });

  it("applies custom className", () => {
    const { container } = render(<Chevron className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("has the correct path for the chevron icon", () => {
    const { container } = render(<Chevron />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M19 9l-7 7-7-7");
  });

  it("combines all classes correctly", () => {
    const { container } = render(
      <Chevron direction="up" className="test-class" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass(
      "w-4",
      "h-4",
      "text-gray-500",
      "transition-transform",
      "test-class",
      "rotate-180"
    );
  });
});
