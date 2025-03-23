import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import RootLayout from "../layout";

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

// Create a custom render function that doesn't wrap in a div
const renderWithoutWrapper = (ui: React.ReactElement) => {
  // Extract the children from the layout component to test them directly
  // This avoids the DOM nesting warning with html element
  return render(ui, {
    container: document.documentElement,
    // Disable wrapper to prevent nesting issues
    wrapper: undefined,
  });
};

describe("RootLayout", () => {
  it("renders the layout content correctly", () => {
    // Extract and test just the body content to avoid html nesting issues
    const BodyContent = () => {
      const layout = RootLayout({
        children: <div data-testid="child-content">Test Content</div>,
      });
      // Extract just the body content from the layout
      return layout.props.children;
    };

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
    // Extract and test just the body element to avoid html nesting issues
    const BodyContent = () => {
      const layout = RootLayout({ children: <div>Test Content</div> });
      // Extract just the body content from the layout
      return layout.props.children;
    };

    const { getByText } = render(<BodyContent />);

    const body = getByText(/AI Model Comparison/).closest("body");
    expect(body).toHaveClass("geist-sans-font");
  });

  it("sets the HTML lang attribute to 'en'", () => {
    // Test the structure of the component directly
    const layout = RootLayout({ children: <div>Test Content</div> });

    // Check that the layout component returns an html element with lang="en"
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("en");
  });
});
