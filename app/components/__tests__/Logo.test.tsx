import { render } from "@testing-library/react";
import Logo from "../Logo";

describe("Logo", () => {
  it("renders without crashing", () => {
    const { container } = render(<Logo />);
    expect(container).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has the correct width and height", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("contains the correct viewBox attribute", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 512 512");
  });

  it("contains the required SVG elements", () => {
    const { container } = render(<Logo />);
    const circles = container.querySelectorAll("circle");
    const paths = container.querySelectorAll("path");
    const lines = container.querySelectorAll("line");

    // Check for the background circle, main circle, and 4 dots
    expect(circles.length).toBe(6);
    // Check for the diamond path
    expect(paths.length).toBe(1);
    // Check for the vertical and horizontal lines
    expect(lines.length).toBe(2);
  });
});
