import { render, screen } from "@testing-library/react";
import MarkdownResponse from "../MarkdownResponse";

// Mock the ReactMarkdown component to avoid ESM module issues in tests
jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => {
      // Simple implementation that converts markdown-like syntax to HTML elements
      // for testing purposes
      const processMarkdown = (text: string) => {
        // Convert headers
        let processed = text.replace(/^# (.*$)/gm, "<h1>$1</h1>");
        processed = processed.replace(/^## (.*$)/gm, "<h2>$1</h2>");

        // Convert bold
        processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convert italic
        processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // Convert links
        processed = processed.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2">$1</a>'
        );

        // Convert code blocks
        processed = processed.replace(/`([^`]+)`/g, "<code>$1</code>");

        // Convert paragraphs (simple version)
        const paragraphs = processed.split("\n\n");
        return paragraphs
          .map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ""))
          .join("");
      };

      return (
        <div
          data-testid="markdown-content"
          dangerouslySetInnerHTML={{ __html: processMarkdown(children) }}
        />
      );
    },
  };
});

describe("MarkdownResponse", () => {
  it("renders plain text content", () => {
    render(<MarkdownResponse content="Hello, world!" />);

    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  it("renders with the correct container class", () => {
    const { container } = render(<MarkdownResponse content="Content" />);

    // Since our mock doesn't preserve the outer container's classes,
    // we need to check the actual container from the render result
    const proseContainer = container.firstChild as HTMLElement;
    expect(proseContainer).toHaveClass("prose");
    expect(proseContainer).toHaveClass("prose-sm");
    expect(proseContainer).toHaveClass("max-w-none");
  });

  it("renders markdown headers correctly", () => {
    const content = "# Main Header\n\n## Secondary Header";
    render(<MarkdownResponse content={content} />);

    expect(screen.getByText("Main Header")).toBeInTheDocument();
    expect(screen.getByText("Secondary Header")).toBeInTheDocument();
  });

  it("renders markdown formatting correctly", () => {
    const content = "This is **bold** and *italic* text.";
    render(<MarkdownResponse content={content} />);

    const element = screen.getByTestId("markdown-content");
    expect(element.innerHTML).toContain("<strong>bold</strong>");
    expect(element.innerHTML).toContain("<em>italic</em>");
  });

  it("renders markdown links correctly", () => {
    const content = "Check out [this link](https://example.com).";
    render(<MarkdownResponse content={content} />);

    const element = screen.getByTestId("markdown-content");
    expect(element.innerHTML).toContain(
      '<a href="https://example.com">this link</a>'
    );
  });

  it("renders code blocks correctly", () => {
    const content = "Use `const x = 5;` for constants.";
    render(<MarkdownResponse content={content} />);

    const element = screen.getByTestId("markdown-content");
    expect(element.innerHTML).toContain("<code>const x = 5;</code>");
  });

  it("handles empty content", () => {
    render(<MarkdownResponse content="" />);

    const container = screen.getByTestId("markdown-content");
    expect(container).toBeInTheDocument();
    expect(container.textContent).toBe("");
  });

  it("renders complex markdown content", () => {
    const complexContent = `
# Welcome to Markdown

This is a paragraph with **bold** and *italic* text.

## Code Examples

Use \`console.log()\` for debugging.

## Links

Visit [example](https://example.com) for more information.
    `;

    render(<MarkdownResponse content={complexContent} />);

    expect(screen.getByText("Welcome to Markdown")).toBeInTheDocument();
    expect(screen.getByText(/This is a paragraph/)).toBeInTheDocument();
    expect(screen.getByText("Code Examples")).toBeInTheDocument();
    expect(screen.getByText(/Visit/)).toBeInTheDocument();

    const element = screen.getByTestId("markdown-content");
    expect(element.innerHTML).toContain("<strong>bold</strong>");
    expect(element.innerHTML).toContain("<em>italic</em>");
    expect(element.innerHTML).toContain("<code>console.log()</code>");
    expect(element.innerHTML).toContain(
      '<a href="https://example.com">example</a>'
    );
  });
});
