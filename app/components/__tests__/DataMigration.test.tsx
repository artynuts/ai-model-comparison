import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataMigration from "../DataMigration";
import { useStorage } from "../../context/StorageContext";
import { LocalStorageProvider } from "../../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../../lib/storage/PostgresStorageProvider";

// Mock dependencies
jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

// Create mock functions for the storage providers
const mockLocalGetHistory = jest.fn();
const mockLocalAddHistory = jest.fn();
const mockPgGetHistory = jest.fn();
const mockPgAddHistory = jest.fn();

// Mock implementations
jest.mock("../../lib/storage/LocalStorageProvider", () => {
  return {
    LocalStorageProvider: jest.fn().mockImplementation(() => {
      return {
        getHistory: mockLocalGetHistory,
        addHistory: mockLocalAddHistory,
      };
    }),
  };
});

jest.mock("../../lib/storage/PostgresStorageProvider", () => {
  return {
    PostgresStorageProvider: jest.fn().mockImplementation(() => {
      return {
        getHistory: mockPgGetHistory,
        addHistory: mockPgAddHistory,
      };
    }),
  };
});

describe("DataMigration", () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default useStorage mock implementation
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "localStorage",
    });

    // Mock implementations for storage providers
    const mockLocalData = [
      { id: "1", query: "local query 1", responses: [], timestamp: 1000 },
      { id: "2", query: "local query 2", responses: [], timestamp: 2000 },
    ];

    const mockPgData = [
      { id: "3", query: "pg query 1", responses: [], timestamp: 3000 },
      { id: "4", query: "pg query 2", responses: [], timestamp: 4000 },
    ];

    // Setup LocalStorageProvider mocks
    mockLocalGetHistory.mockResolvedValue(mockLocalData);
    mockLocalAddHistory.mockImplementation((query, responses, id) => {
      // Simulate skipping queries that already exist
      if (query === "pg query 1") {
        return Promise.resolve({ id: id || "3", skipped: true });
      }
      return Promise.resolve({ id: id || "new-id", skipped: false });
    });

    // Setup PostgresStorageProvider mocks
    mockPgGetHistory.mockResolvedValue(mockPgData);
    mockPgAddHistory.mockImplementation((query, responses, id) => {
      // Simulate skipping queries that already exist
      if (query === "local query 1") {
        return Promise.resolve({ id: id || "1", skipped: true });
      }
      return Promise.resolve({ id: id || "new-id", skipped: false });
    });
  });

  it("renders migration button with correct text for localStorage", () => {
    render(<DataMigration />);

    expect(screen.getByText("Data Migration")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Transfer your data between localStorage and PostgreSQL database"
      )
    ).toBeInTheDocument();

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    expect(migrateButton).toBeInTheDocument();
    expect(migrateButton).toBeEnabled();
  });

  it("renders migration button with correct text for PostgreSQL", () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });

    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to localStorage/i,
    });
    expect(migrateButton).toBeInTheDocument();
    expect(migrateButton).toBeEnabled();
  });

  it("shows loading state when migration starts", async () => {
    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    fireEvent.click(migrateButton);

    expect(
      screen.getByRole("button", { name: /Migrating.../i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByText(/Starting migration to PostgreSQL.../i)
      ).toBeInTheDocument();
    });
  });

  it("migrates data from localStorage to PostgreSQL", async () => {
    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    fireEvent.click(migrateButton);

    // Check for completion status
    await waitFor(() => {
      expect(screen.getByText(/Migration complete:/i)).toBeInTheDocument();
    });

    // Verify the final status includes expected counts
    expect(
      screen.getByText(
        /Migration complete: 1 items migrated, 1 items skipped./i
      )
    ).toBeInTheDocument();

    // Verify methods were called correctly
    expect(mockLocalGetHistory).toHaveBeenCalled();
    expect(mockPgAddHistory).toHaveBeenCalledTimes(2);

    // Check that the specific queries were passed to addHistory
    const queriesPassed = mockPgAddHistory.mock.calls.map(
      (call: any[]) => call[0]
    );
    expect(queriesPassed).toContain("local query 1");
    expect(queriesPassed).toContain("local query 2");
  });

  it("migrates data from PostgreSQL to localStorage", async () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });

    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to localStorage/i,
    });
    fireEvent.click(migrateButton);

    // Check for completion status
    await waitFor(() => {
      expect(screen.getByText(/Migration complete:/i)).toBeInTheDocument();
    });

    // Verify the final status includes expected counts
    expect(
      screen.getByText(
        /Migration complete: 1 items migrated, 1 items skipped./i
      )
    ).toBeInTheDocument();

    // Verify methods were called correctly
    expect(mockPgGetHistory).toHaveBeenCalled();
    expect(mockLocalAddHistory).toHaveBeenCalledTimes(2);

    // Check that the specific queries were passed to addHistory
    const queriesPassed = mockLocalAddHistory.mock.calls.map(
      (call: any[]) => call[0]
    );
    expect(queriesPassed).toContain("pg query 1");
    expect(queriesPassed).toContain("pg query 2");
  });

  it("shows message when no data is available to migrate from localStorage", async () => {
    // Override mock to return empty array
    mockLocalGetHistory.mockResolvedValueOnce([]);

    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    fireEvent.click(migrateButton);

    await waitFor(() => {
      expect(
        screen.getByText("No data found in localStorage to migrate.")
      ).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("shows message when no data is available to migrate from PostgreSQL", async () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });

    // Override mock to return empty array
    mockPgGetHistory.mockResolvedValueOnce([]);

    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to localStorage/i,
    });
    fireEvent.click(migrateButton);

    await waitFor(() => {
      expect(
        screen.getByText("No data found in PostgreSQL to migrate.")
      ).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("handles errors during migration from localStorage", async () => {
    // Mock console.error to prevent actual console output in tests
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Setup LocalStorageProvider to throw an error
    mockLocalGetHistory.mockRejectedValueOnce(new Error("Test error"));

    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    fireEvent.click(migrateButton);

    await waitFor(() => {
      expect(
        screen.getByText("Migration failed. Please try again.")
      ).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(screen.getByRole("button")).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Migrate to PostgreSQL/i })
    ).toBeInTheDocument();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Migration failed:",
      expect.any(Error)
    );
  });

  it("displays skipped queries when some items are skipped", async () => {
    render(<DataMigration />);

    const migrateButton = screen.getByRole("button", {
      name: /Migrate to PostgreSQL/i,
    });
    fireEvent.click(migrateButton);

    // Wait for migration to complete
    await waitFor(() => {
      expect(screen.getByText(/Migration complete:/i)).toBeInTheDocument();
    });

    // There should be a collapsible section for skipped queries
    expect(screen.getByText("Skipped queries:")).toBeInTheDocument();

    // We mocked "local query 1" to be skipped
    expect(screen.getByText(/\"local query 1\"/)).toBeInTheDocument();
  });
});
