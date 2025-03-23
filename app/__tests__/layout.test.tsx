import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import RootLayout, { metadata, viewport } from "../layout";

// Mock the Logo component
jest.mock("../components/Logo", () => {
  return function MockLogo() {
    return <div data-testid="logo">Logo</div>;
  };
});

// Mock the Sidebar component
jest.mock("../components/Sidebar", () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

// Mock the StorageProvider and HistoryProvider
jest.mock("../context/StorageContext", () => ({
  StorageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="storage-provider">{children}</div>
  ),
}));

jest.mock("../context/HistoryContext", () => ({
  HistoryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="history-provider">{children}</div>
  ),
}));

// Mock the GeistSans font
jest.mock("geist/font/sans", () => ({
  GeistSans: {
    className: "geist-sans-font",
  },
}));

// Mock Next.js metadata (to avoid console warnings)
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
}));

describe("RootLayout", () => {
  // Instead of rendering the whole layout which causes DOM nesting issues,
  // we'll extract just the components we need to test
  it("renders the layout content correctly", () => {
    // Create a test component that just renders the inner content of the body
    function BodyContent() {
      // Get the body content from the layout
      const layout = RootLayout({
        children: <div data-testid="child-content">Test Content</div>,
      });

      // Extract just the body's children to avoid nesting a body in a div during testing
      const bodyProps = layout.props.children.props;
      return <div className={bodyProps.className}>{bodyProps.children}</div>;
    }

    const { getByTestId, getByText, getByRole } = render(<BodyContent />);

    // Check header and title
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "AI Model Comparison"
    );

    // Check app description is present
    expect(
      getByText(/Compare responses from different LLM models/i)
    ).toBeInTheDocument();

    // Check logo renders
    expect(getByTestId("logo")).toBeInTheDocument();

    // Check the sidebar is rendered
    expect(getByTestId("sidebar")).toBeInTheDocument();

    // Check the providers are used
    expect(getByTestId("storage-provider")).toBeInTheDocument();
    expect(getByTestId("history-provider")).toBeInTheDocument();

    // Check the main content area
    expect(getByRole("main")).toBeInTheDocument();

    // Check the child content is rendered
    expect(getByTestId("child-content")).toBeInTheDocument();
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies the GeistSans font to the body", () => {
    // Create a test component that just checks the body class name
    function BodyClassTest() {
      const layout = RootLayout({ children: <div>Test Content</div> });
      // Extract the className from the body element
      const bodyClassName = layout.props.children.props.className;
      return (
        <div data-testid="body-class" className={bodyClassName}>
          Test Content
        </div>
      );
    }

    const { getByTestId } = render(<BodyClassTest />);
    expect(getByTestId("body-class")).toHaveClass("geist-sans-font");
  });

  it("sets the HTML lang attribute to 'en'", () => {
    // Test the structure of the component directly
    const layout = RootLayout({ children: <div>Test Content</div> });

    // Check that the layout component returns an html element with lang="en"
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("en");
  });
});

describe("Metadata", () => {
  it("has the correct title and description", () => {
    expect(metadata.title).toBe("AI Model Comparison");
    expect(metadata.description).toBe(
      "Compare responses from different AI models"
    );
  });

  it("defines the correct icon", () => {
    // Using type assertion to handle Next.js Metadata types
    expect(metadata.icons).toBeDefined();
    const icons = metadata.icons as { icon: { url: string; type: string } };
    expect(icons.icon).toEqual({
      url: "/icons/icon.svg",
      type: "image/svg+xml",
    });
  });

  it("includes a manifest reference", () => {
    expect(metadata.manifest).toBe("/manifest.json");
  });
});

describe("Viewport", () => {
  it("defines the correct theme color", () => {
    expect(viewport.themeColor).toBe("#4F46E5");
  });
});
