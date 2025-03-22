import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataDeletion from "../DataDeletion";
import { useStorage } from "../../context/StorageContext";
import { getStorageDisplayName } from "../../lib/utils/storage";

// Mock dependencies
jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

jest.mock("../../lib/utils/storage", () => ({
  getStorageDisplayName: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.confirm
global.confirm = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("DataDeletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "localStorage",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("Local Storage");
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });
  });

  it("displays deletion option for the current storage type", () => {
    render(<DataDeletion />);

    expect(screen.getByText("Data Deletion")).toBeVisible();
    expect(
      screen.getByText(/Permanently delete all data from Local Storage/)
    ).toBeVisible();

    const deleteButton = screen.getByRole("button", {
      name: /Delete All Local Storage Data/,
    });
    expect(deleteButton).toBeVisible();
  });

  it("completes the deletion process successfully", async () => {
    render(<DataDeletion />);

    // Verify initial state
    const deleteButton = screen.getByRole("button", {
      name: /Delete All Local Storage Data/,
    });
    expect(deleteButton).toBeEnabled();

    // Trigger deletion
    fireEvent.click(deleteButton);

    // Wait for successful completion
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully deleted all data/)
      ).toBeInTheDocument();
    });

    // Verify local storage was called
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("queryHistory");
  });

  it("prompts user for confirmation before deletion", async () => {
    render(<DataDeletion />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete All Local Storage Data/,
    });
    fireEvent.click(deleteButton);

    // Confirm should have been called
    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete all data? This action cannot be undone."
    );

    // Local storage should be affected since we mocked confirm to return true
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("queryHistory");
  });

  it("cancels deletion when user rejects confirmation", async () => {
    // Mock the confirm to return false (user clicked Cancel)
    (global.confirm as jest.Mock).mockReturnValueOnce(false);

    render(<DataDeletion />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete All Local Storage Data/,
    });
    fireEvent.click(deleteButton);

    // Confirm should have been called
    expect(global.confirm).toHaveBeenCalled();

    // Local storage should not be affected
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it("handles localStorage data deletion correctly", async () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "localStorage",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("Local Storage");

    render(<DataDeletion />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete All Local Storage Data/,
    });
    fireEvent.click(deleteButton);

    // Wait for the deletion to complete
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully deleted all data/)
      ).toBeInTheDocument();
    });

    // Verify localStorage was called with the right key
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("queryHistory");

    // Fetch should not be called for localStorage
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles PostgreSQL data deletion correctly", async () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("PostgreSQL Database");

    render(<DataDeletion />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete All PostgreSQL Database Data/,
    });
    fireEvent.click(deleteButton);

    // Wait for the deletion to complete
    await waitFor(() => {
      expect(
        screen.getByText(/Successfully deleted all data/)
      ).toBeInTheDocument();
    });

    // Verify fetch was called with the right endpoint and method
    expect(global.fetch).toHaveBeenCalledWith("/api/history/all", {
      method: "DELETE",
    });

    // localStorage should not be affected
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it("shows error message when deletion fails", async () => {
    // Simulate an API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("PostgreSQL Database");

    // Spy on console.error
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<DataDeletion />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete All PostgreSQL Database Data/,
    });
    fireEvent.click(deleteButton);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete data/)).toBeInTheDocument();
    });

    // Console error should be called
    expect(console.error).toHaveBeenCalledWith(
      "Data deletion failed:",
      expect.any(Error)
    );
  });
});
