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

  it("ensures content is properly formatted for readability", () => {
    const { container } = render(<MarkdownResponse content="Content" />);

    // Instead of checking specific class names, verify the component
    // provides a properly formatted container for content
    expect(container.firstChild).toBeInTheDocument();

    // The firstChild should be a div (the container)
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.tagName).toBe("DIV");

    // Verify it contains the rendered content
    expect(containerElement.textContent).toBe("Content");
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

    // Focus on the rendered output that users would see
    const boldText = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === "strong" && content === "bold";
    });

    const italicText = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === "em" && content === "italic";
    });

    expect(boldText).toBeInTheDocument();
    expect(italicText).toBeInTheDocument();
  });

  it("renders markdown links correctly", () => {
    const content = "Check out [this link](https://example.com).";
    render(<MarkdownResponse content={content} />);

    // Focus on the actual link that users would interact with
    const link = screen.getByText("this link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders code blocks correctly", () => {
    const content = "Use `const x = 5;` for constants.";
    render(<MarkdownResponse content={content} />);

    // Focus on the code block that users would see
    const codeElement = screen.getByText("const x = 5;");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe("CODE");
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

    // Check for key elements that users would see
    expect(
      screen.getByRole("heading", { name: "Welcome to Markdown" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Code Examples" })
    ).toBeInTheDocument();

    // Check for the formatted text elements
    const boldText = screen.getByText("bold");
    expect(boldText.tagName).toBe("STRONG");

    const italicText = screen.getByText("italic");
    expect(italicText.tagName).toBe("EM");

    // Check for code element
    const codeElement = screen.getByText("console.log()");
    expect(codeElement.tagName).toBe("CODE");

    // Check for link
    const link = screen.getByText("example");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });
});
