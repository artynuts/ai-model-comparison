import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";
import { useStorage } from "../../context/StorageContext";

// Mock the StorageContext
jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Sidebar", () => {
  const mockHistory = [
    {
      id: "1",
      query: "test query 1",
      timestamp: new Date("2024-03-18T10:00:00").getTime(),
    },
    {
      id: "2",
      query: "test query 2",
      timestamp: new Date("2024-03-18T11:00:00").getTime(),
    },
  ];
  const mockDeleteFromHistory = jest.fn();

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue({
      history: mockHistory,
      deleteFromHistory: mockDeleteFromHistory,
    });

    // Mock window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Compare")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Ratings")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("highlights active link", () => {
    render(<Sidebar />);
    const activeLink = screen.getByText("Compare");
    expect(activeLink.closest("a")).toHaveClass("bg-blue-50");
  });

  it("renders StorageSelector component", () => {
    render(<Sidebar />);
    expect(screen.getByText("Storage Type:")).toBeInTheDocument();
  });

  it("toggles recent queries visibility", () => {
    render(<Sidebar />);
    const toggleButton = screen.getByRole("button", {
      name: /recent queries/i,
    });

    // Toggle closed
    fireEvent.click(toggleButton);

    // Toggle open again to test visibility
    fireEvent.click(toggleButton);

    // Query should be visible when open
    expect(screen.getByText("test query 1")).toBeVisible();
  });

  it("calls delete function when delete button is clicked", () => {
    render(<Sidebar />);
    // Get all delete buttons and use the first one
    const deleteButtons = screen.getAllByTitle("Delete query");
    fireEvent.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this query?"
    );
    expect(mockDeleteFromHistory).toHaveBeenCalledWith("1");
  });

  it("formats timestamp correctly", () => {
    render(<Sidebar />);
    // Look for the timestamps in the format they're actually displayed
    expect(screen.getByText(/3\/18\/2024.*10:00:00 AM/)).toBeInTheDocument();
    expect(screen.getByText(/3\/18\/2024.*11:00:00 AM/)).toBeInTheDocument();
  });

  it("encodes query parameters in links", () => {
    render(<Sidebar />);
    const links = screen.getAllByRole("link", { name: /test query/i });
    expect(links[0].getAttribute("href")).toBe(
      "/history?query=test%20query%201"
    );
    expect(links[1].getAttribute("href")).toBe(
      "/history?query=test%20query%202"
    );
  });
});
