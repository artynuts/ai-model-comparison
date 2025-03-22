import { render, screen, fireEvent } from "@testing-library/react";
import StorageSelector from "../StorageSelector";
import { useStorage } from "../../context/StorageContext";

// Mock the StorageContext
jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

// Mock the Chevron component
jest.mock("../Chevron", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="chevron-icon">Chevron Icon</div>,
  };
});

describe("StorageSelector", () => {
  const mockSetStorageType = jest.fn();

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "localStorage",
      setStorageType: mockSetStorageType,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with localStorage selected by default", () => {
    render(<StorageSelector />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("localStorage");
    expect(screen.getByText("Storage Type:")).toBeInTheDocument();
  });

  it("renders the Chevron component", () => {
    render(<StorageSelector />);
    expect(screen.getByTestId("chevron-icon")).toBeInTheDocument();
  });

  it("calls setStorageType when a different option is selected", () => {
    render(<StorageSelector />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "postgres" } });

    expect(mockSetStorageType).toHaveBeenCalledWith("postgres");
  });

  it("applies 'sidebar' variant styling by default", () => {
    render(<StorageSelector />);

    const container = screen.getByText("Storage Type:").closest("div");
    expect(container).toHaveClass("mt-4", "mb-4", "px-2");
  });

  it("does not apply sidebar styling when 'settings' variant is used", () => {
    render(<StorageSelector variant="settings" />);

    const container = screen.getByText("Storage Type:").closest("div");
    expect(container).not.toHaveClass("mt-4", "mb-4", "px-2");
  });

  it("shows PostgreSQL and localStorage options", () => {
    render(<StorageSelector />);

    expect(screen.getByText("PostgreSQL Database")).toBeInTheDocument();
    expect(screen.getByText("Browser Local Storage")).toBeInTheDocument();
  });

  it("renders with postgres selected when context provides it", () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
      setStorageType: mockSetStorageType,
    });

    render(<StorageSelector />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("postgres");
  });
});
