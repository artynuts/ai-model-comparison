import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataValidation from "../DataValidation";
import { useStorage } from "../../context/StorageContext";
import { LocalStorageProvider } from "../../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../../lib/storage/PostgresStorageProvider";
import { getStorageDisplayName } from "../../lib/utils/storage";
import { HistoryItem } from "../../lib/storage/StorageProvider";
import { AIResponse } from "../../types";

// Mock dependencies
jest.mock("../../context/StorageContext", () => ({
  useStorage: jest.fn(),
}));

jest.mock("../../lib/utils/storage", () => ({
  getStorageDisplayName: jest.fn(),
}));

// Create mock functions for the storage providers
const mockLocalGetHistory = jest.fn();
const mockLocalAddHistory = jest.fn();
const mockPgGetHistory = jest.fn();
const mockPgAddHistory = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

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

// Mock UUID
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid"),
}));

describe("DataValidation", () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default useStorage mock implementation
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "localStorage",
    });

    // Default getStorageDisplayName mock implementation
    (getStorageDisplayName as jest.Mock).mockReturnValue("Local Storage");

    // Console spy to prevent actual console outputs
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders validation button with correct text for localStorage", () => {
    render(<DataValidation />);

    expect(screen.getByText("Data Validation")).toBeInTheDocument();
    expect(
      screen.getByText("Check and fix data integrity issues in Local Storage")
    ).toBeInTheDocument();

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    expect(validateButton).toBeInTheDocument();
    expect(validateButton).toBeEnabled();
  });

  it("renders validation button with correct text for PostgreSQL", () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("PostgreSQL");

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix PostgreSQL Data/i,
    });
    expect(validateButton).toBeInTheDocument();
    expect(validateButton).toBeEnabled();
  });

  it("shows loading state when validation starts", async () => {
    // Set up mock to delay resolution
    mockLocalGetHistory.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    expect(
      screen.getByRole("button", { name: /Validating.../i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/Starting validation.../i)).toBeInTheDocument();
    });
  });

  it("shows message when no data is available to validate", async () => {
    // Mock empty data
    mockLocalGetHistory.mockResolvedValue([]);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(
        screen.getByText("No data found in localStorage to validate.")
      ).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(
      screen.getByRole("button", { name: /Fix Local Storage Data/i })
    ).toBeEnabled();
  });

  it("validates and fixes data with various issues in localStorage", async () => {
    // Mock data with issues: missing IDs, untrimmed queries, etc.
    const mockData: (Partial<HistoryItem> & {
      responses: Partial<AIResponse>[];
    })[] = [
      {
        id: "", // Missing ID
        query: "  query with spaces  ", // Untrimmed query
        timestamp: 2000,
        responses: [
          {
            id: "resp-id-1",
            modelName: "model1",
            provider: "provider1",
            version: "1.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "existing-id",
        query: "valid query",
        timestamp: 3000, // Newer but comes second (wrong order)
        responses: [
          {
            id: "", // Missing response ID
            modelName: "model2",
            provider: "provider2",
            version: "2.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
    ];

    mockLocalGetHistory.mockResolvedValue(mockData as HistoryItem[]);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for validation to complete - use a more flexible approach
    await waitFor(() => {
      const statusText = screen.getByText(/Fixed \d+ items with issues/);
      expect(statusText).toBeInTheDocument();
    });

    // Verify local storage was updated with fixed data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "queryHistory",
      expect.any(String)
    );

    // Get the JSON string that was passed to localStorage.setItem
    const setItemArgs = localStorageMock.setItem.mock.calls[0];
    const fixedData = JSON.parse(setItemArgs[1]);

    // Verify fixed data is sorted by timestamp (most recent first)
    expect(fixedData[0].timestamp).toBeGreaterThan(fixedData[1].timestamp);

    // Verify queries were trimmed
    expect(
      fixedData.find((item: any) => item.query === "query with spaces")
    ).toBeTruthy();

    // Verify IDs were added
    expect(
      fixedData.every((item: any) => item.id && item.id.trim() !== "")
    ).toBe(true);
    expect(
      fixedData.every((item: any) =>
        item.responses.every(
          (response: any) => response.id && response.id.trim() !== ""
        )
      )
    ).toBe(true);

    // Verify the details section is available
    expect(screen.getByText("Show Details")).toBeInTheDocument();
  });

  it("validates and fixes data with various issues in PostgreSQL", async () => {
    (useStorage as jest.Mock).mockReturnValue({
      storageType: "postgres",
    });
    (getStorageDisplayName as jest.Mock).mockReturnValue("PostgreSQL");

    // Mock data with issues
    const mockData: (Partial<HistoryItem> & {
      responses: Partial<AIResponse>[];
    })[] = [
      {
        id: "pg-id-1",
        query: "  postgres query with spaces  ", // Untrimmed query
        timestamp: 1000,
        responses: [
          {
            id: "",
            modelName: "model1",
            provider: "provider1",
            version: "1.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "pg-id-2",
        query: "valid postgres query",
        timestamp: 2000,
        responses: [
          {
            id: "resp-id",
            modelName: "model2",
            provider: "provider2",
            version: "2.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
    ];

    mockPgGetHistory.mockResolvedValue(mockData as HistoryItem[]);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix PostgreSQL Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for validation to complete - use a more flexible approach
    await waitFor(() => {
      const statusText = screen.getByText(/Fixed \d+ items with issues/);
      expect(statusText).toBeInTheDocument();
    });

    // Verify Postgres provider was used to add updated items
    expect(mockPgAddHistory).toHaveBeenCalled();
    const callArgs = mockPgAddHistory.mock.calls[0];

    // Verify trimmed query was sent
    expect(callArgs[0]).toBe("postgres query with spaces");

    // Verify the original ID was preserved
    expect(callArgs[2]).toBe("pg-id-1");
  });

  it("handles validation when no issues are found", async () => {
    // Mock data without issues
    const mockData = [
      {
        id: "id-1",
        query: "valid query 1",
        timestamp: 2000,
        responses: [
          {
            id: "resp-1",
            modelName: "model1",
            provider: "provider1",
            version: "1.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "id-2",
        query: "valid query 2",
        timestamp: 1000,
        responses: [
          {
            id: "resp-2",
            modelName: "model2",
            provider: "provider2",
            version: "2.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
    ];

    mockLocalGetHistory.mockResolvedValue(mockData);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for validation to complete
    await waitFor(() => {
      expect(
        screen.getByText("No issues found in localStorage data.")
      ).toBeInTheDocument();
    });

    // Verify localStorage wasn't updated since no changes were needed
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("handles errors during validation", async () => {
    // Mock error during data fetch
    mockLocalGetHistory.mockRejectedValue(new Error("Test error"));

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText("Validation failed. Please try again.")
      ).toBeInTheDocument();
    });

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Validation failed:",
      expect.any(Error)
    );

    // Button should be enabled again
    expect(
      screen.getByRole("button", { name: /Fix Local Storage Data/i })
    ).toBeEnabled();
  });

  it("properly shows validation results with item details", async () => {
    // Mock data with all types of issues except order issues
    const mockData: (Partial<HistoryItem> & {
      responses: Partial<AIResponse>[];
    })[] = [
      {
        id: "",
        query: "  query1  ",
        timestamp: 3000, // Newest first (correct order)
        responses: [
          {
            id: "",
            modelName: "model1",
            provider: "provider1",
            version: "1.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "id2",
        query: "  query2  ",
        timestamp: 2000, // Middle (correct order)
        responses: [
          {
            id: "resp-id",
            modelName: "model2",
            provider: "provider2",
            version: "2.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "id3",
        query: "query3",
        timestamp: 1000, // Oldest last (correct order)
        responses: [
          {
            id: "",
            modelName: "model3",
            provider: "provider3",
            version: "3.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
    ];

    mockLocalGetHistory.mockResolvedValue(mockData as HistoryItem[]);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for validation to complete and check for comprehensive results
    await waitFor(() => {
      expect(
        screen.getByText(/Fixed \d+ items with issues/i)
      ).toBeInTheDocument();
    });

    // Check for the collapsible details section
    const detailsButton = screen.getByText("Show Details");

    // Expand the details section
    fireEvent.click(detailsButton);

    // Verify the detailed stats are shown
    expect(screen.getByText(/Total items checked: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Items with missing IDs: 1/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Responses with missing IDs: 2/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Queries trimmed: 2/i)).toBeInTheDocument();

    // Verify that order fixing notice is NOT present since our data was in correct chronological order
    expect(
      screen.queryByText(/Fixed incorrect timestamp ordering/i)
    ).not.toBeInTheDocument();

    // Verify localStorage was updated with fixed data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "queryHistory",
      expect.any(String)
    );

    // Get the JSON string that was passed to localStorage.setItem
    const setItemArgs = localStorageMock.setItem.mock.calls[0];
    const fixedData = JSON.parse(setItemArgs[1]);

    // Items should be sorted newest first (reverse of our input)
    expect(fixedData[0].timestamp).toBe(3000);
    expect(fixedData[1].timestamp).toBe(2000);
    expect(fixedData[2].timestamp).toBe(1000);
  });

  it("detects and fixes incorrect timestamp ordering", async () => {
    // Mock data with incorrect timestamp order (not in descending order)
    const mockData: (Partial<HistoryItem> & {
      responses: Partial<AIResponse>[];
    })[] = [
      {
        id: "id1",
        query: "query1",
        timestamp: 1000, // Oldest item first
        responses: [
          {
            id: "resp-1",
            modelName: "model1",
            provider: "provider1",
            version: "1.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "id2",
        query: "query2",
        timestamp: 3000, // Newest item in middle (incorrect order)
        responses: [
          {
            id: "resp-2",
            modelName: "model2",
            provider: "provider2",
            version: "2.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
      {
        id: "id3",
        query: "query3",
        timestamp: 2000, // Middle timestamp at end (incorrect order)
        responses: [
          {
            id: "resp-3",
            modelName: "model3",
            provider: "provider3",
            version: "3.0",
            description: "",
            response: "",
            latency: 0,
          },
        ],
      },
    ];

    mockLocalGetHistory.mockResolvedValue(mockData as HistoryItem[]);

    render(<DataValidation />);

    const validateButton = screen.getByRole("button", {
      name: /Fix Local Storage Data/i,
    });
    fireEvent.click(validateButton);

    // Wait for validation to complete
    await waitFor(() => {
      expect(
        screen.getByText(/Fixed \d+ items with issues/i)
      ).toBeInTheDocument();
    });

    // Expand the details section
    const detailsButton = screen.getByText("Show Details");
    fireEvent.click(detailsButton);

    // Verify that the order fixed notification IS present
    expect(
      screen.getByText(/Fixed incorrect timestamp ordering/i)
    ).toBeInTheDocument();

    // Verify localStorage was updated with reordered data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "queryHistory",
      expect.any(String)
    );

    // Get the JSON string that was passed to localStorage.setItem
    const setItemArgs = localStorageMock.setItem.mock.calls[0];
    const fixedData = JSON.parse(setItemArgs[1]);

    // Verify items are now sorted by timestamp in descending order (newest first)
    expect(fixedData[0].timestamp).toBe(3000);
    expect(fixedData[1].timestamp).toBe(2000);
    expect(fixedData[2].timestamp).toBe(1000);
  });
});
