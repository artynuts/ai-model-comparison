import { render } from "@testing-library/react";
import ThumbsIcon from "../ThumbsIcon";

describe("ThumbsIcon", () => {
  it("renders with thumbs up direction", () => {
    const { container } = render(
      <ThumbsIcon direction="up" selected={false} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveClass("rotate-180");
  });

  it("renders with thumbs down direction", () => {
    const { container } = render(
      <ThumbsIcon direction="down" selected={false} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("rotate-180");
  });

  it("applies selected state for thumbs up", () => {
    const { container } = render(<ThumbsIcon direction="up" selected={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-green-100");
    expect(svg).toHaveAttribute("stroke", "#22c55e");
  });

  it("applies selected state for thumbs down", () => {
    const { container } = render(
      <ThumbsIcon direction="down" selected={true} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-100");
    expect(svg).toHaveAttribute("stroke", "#ef4444");
  });

  it("applies unselected state", () => {
    const { container } = render(
      <ThumbsIcon direction="up" selected={false} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-gray-300");
    expect(svg).toHaveAttribute("stroke", "none");
  });

  it("applies custom class name", () => {
    const { container } = render(
      <ThumbsIcon direction="up" selected={false} className="w-10 h-10" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-10", "h-10");
    expect(svg).not.toHaveClass("w-5", "h-5");
  });

  it("renders with default class name when not provided", () => {
    const { container } = render(
      <ThumbsIcon direction="up" selected={false} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-5", "h-5");
  });

  it("has the correct path for the thumbs icon", () => {
    const { container } = render(
      <ThumbsIcon direction="up" selected={false} />
    );
    const path = container.querySelector("path");
    expect(path).toHaveAttribute(
      "d",
      "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
    );
  });
});
