import { render, screen, waitFor, act } from "@testing-library/react";
import { StorageProvider, useStorage } from "../StorageContext";
import { AIResponse, ResponseRating } from "../../types";
import { PostgresStorageProvider } from "../../lib/storage/PostgresStorageProvider";
import { LocalStorageProvider } from "../../lib/storage/LocalStorageProvider";

// Mock the storage providers
jest.mock("../../lib/storage/PostgresStorageProvider");
jest.mock("../../lib/storage/LocalStorageProvider");

// Sample history data for tests
const mockHistoryData = [
  {
    id: "123",
    query: "Test query 1",
    timestamp: 1234567890,
    responses: [
      {
        modelName: "Model A",
        id: "resp1",
        provider: "Provider X",
        version: "1.0",
        description: "Test model",
        response: "Test response 1",
        latency: 100,
      } as AIResponse,
    ],
  },
  {
    id: "456",
    query: "Test query 2",
    timestamp: 1234567891,
    responses: [
      {
        modelName: "Model B",
        id: "resp2",
        provider: "Provider Y",
        version: "2.0",
        description: "Test model 2",
        response: "Test response 2",
        latency: 200,
      } as AIResponse,
    ],
  },
];

// Mock component to test the hook
function TestComponent() {
  const {
    storageType,
    setStorageType,
    history,
    addToHistory,
    deleteFromHistory,
    updateResponseRating,
  } = useStorage();

  return (
    <div>
      <div data-testid="storage-type">{storageType}</div>
      <div data-testid="history-length">{history.length}</div>
      <div data-testid="first-query">{history[0]?.query}</div>
      <button
        data-testid="toggle-storage"
        onClick={() =>
          setStorageType(
            storageType === "postgres" ? "localStorage" : "postgres"
          )
        }
      >
        Toggle Storage
      </button>
      <button
        data-testid="add-button"
        onClick={async () => {
          try {
            await addToHistory("New query", [
              {
                modelName: "Test Model",
                id: "new-resp",
                provider: "Test Provider",
                version: "1.0",
                description: "Test description",
                response: "Test response",
                latency: 150,
              } as AIResponse,
            ]);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Add
      </button>
      <button
        data-testid="delete-button"
        onClick={() => deleteFromHistory("123")}
      >
        Delete
      </button>
      <button
        data-testid="rate-button"
        onClick={() =>
          updateResponseRating("123", 0, {
            accuracy: true,
            relevance: true,
            completeness: true,
            concise: true,
            unbiased: true,
          })
        }
      >
        Rate
      </button>
    </div>
  );
}

describe("StorageContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Setup mocks for PostgresStorageProvider
    const mockProvider = {
      getHistory: jest.fn().mockResolvedValue(mockHistoryData),
      addHistory: jest.fn().mockResolvedValue({ id: "new-id", skipped: false }),
      deleteHistory: jest.fn().mockResolvedValue(true),
      updateResponseRating: jest.fn().mockResolvedValue(true),
    };

    (PostgresStorageProvider as jest.Mock).mockImplementation(
      () => mockProvider
    );
    (LocalStorageProvider as jest.Mock).mockImplementation(() => ({
      ...mockProvider,
    }));
  });

  test("provides history and uses postgres storage by default", async () => {
    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Check default storage type
    expect(screen.getByTestId("storage-type").textContent).toBe("postgres");

    // Wait for the history to be fetched
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");
    expect(PostgresStorageProvider).toHaveBeenCalled();
  });

  test("switches between storage providers", async () => {
    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Wait for initial history load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Switch to localStorage
    await act(async () => {
      screen.getByTestId("toggle-storage").click();
    });

    // Verify storage type changed and localStorage provider was called
    await waitFor(() => {
      expect(screen.getByTestId("storage-type").textContent).toBe(
        "localStorage"
      );
    });
    expect(LocalStorageProvider).toHaveBeenCalled();

    // Switch back to postgres
    await act(async () => {
      screen.getByTestId("toggle-storage").click();
    });

    // Verify storage type changed back
    await waitFor(() => {
      expect(screen.getByTestId("storage-type").textContent).toBe("postgres");
    });
  });

  test("saves storage preference to localStorage", async () => {
    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Switch to localStorage
    await act(async () => {
      screen.getByTestId("toggle-storage").click();
    });

    // Check that localStorage.setItem was called with the right parameters
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "preferred_storage",
      "localStorage"
    );
  });

  test("loads storage preference from localStorage", async () => {
    // Set mock localStorage value
    window.localStorage.getItem = jest.fn().mockReturnValue("localStorage");

    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Verify storage type was set from localStorage
    await waitFor(() => {
      expect(screen.getByTestId("storage-type").textContent).toBe(
        "localStorage"
      );
    });

    expect(window.localStorage.getItem).toHaveBeenCalledWith(
      "preferred_storage"
    );

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });
  });

  test("adds item to history", async () => {
    // Mock the provider implementation specifically for this test
    const addHistorySpy = jest
      .fn()
      .mockResolvedValue({ id: "new-id", skipped: false });
    const getHistorySpy = jest
      .fn()
      .mockResolvedValueOnce(mockHistoryData) // Initial call
      .mockResolvedValueOnce([
        // After adding item
        {
          id: "new-id",
          query: "New query",
          timestamp: 1234567892,
          responses: [
            {
              modelName: "Test Model",
              id: "new-resp",
              provider: "Test Provider",
              version: "1.0",
              description: "Test description",
              response: "Test response",
              latency: 150,
            },
          ],
        },
        ...mockHistoryData,
      ]);

    (PostgresStorageProvider as jest.Mock).mockImplementation(() => ({
      getHistory: getHistorySpy,
      addHistory: addHistorySpy,
      deleteHistory: jest.fn().mockResolvedValue(true),
      updateResponseRating: jest.fn().mockResolvedValue(true),
    }));

    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Wait for initial history load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Click the add button
    await act(async () => {
      screen.getByTestId("add-button").click();
    });

    // Verify provider methods were called and UI updated
    await waitFor(() => {
      expect(addHistorySpy).toHaveBeenCalledWith(
        "New query",
        expect.any(Array)
      );
      expect(screen.getByTestId("history-length").textContent).toBe("3");
      expect(screen.getByTestId("first-query").textContent).toBe("New query");
    });
  });

  test("deletes item from history", async () => {
    // Mock the provider implementation specifically for this test
    const deleteHistorySpy = jest.fn().mockResolvedValue(true);
    const getHistorySpy = jest
      .fn()
      .mockResolvedValueOnce(mockHistoryData) // Initial call
      .mockResolvedValueOnce([mockHistoryData[1]]); // After deletion - only second item remains

    (PostgresStorageProvider as jest.Mock).mockImplementation(() => ({
      getHistory: getHistorySpy,
      addHistory: jest.fn().mockResolvedValue({ id: "new-id", skipped: false }),
      deleteHistory: deleteHistorySpy,
      updateResponseRating: jest.fn().mockResolvedValue(true),
    }));

    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Wait for initial history load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Click the delete button
    await act(async () => {
      screen.getByTestId("delete-button").click();
    });

    // Verify provider methods were called and UI updated
    await waitFor(() => {
      expect(deleteHistorySpy).toHaveBeenCalledWith("123");
      expect(screen.getByTestId("history-length").textContent).toBe("1");
      expect(screen.getByTestId("first-query").textContent).toBe(
        "Test query 2"
      );
    });
  });

  test("updates response rating", async () => {
    // Mock the provider implementation specifically for this test
    const updateRatingSpy = jest.fn().mockResolvedValue(true);

    // Create updated data with rating
    const updatedData = [...mockHistoryData];
    (updatedData[0].responses[0] as AIResponse).rating = {
      accuracy: true,
      relevance: true,
      completeness: true,
      concise: true,
      unbiased: true,
    };

    const getHistorySpy = jest
      .fn()
      .mockResolvedValueOnce(mockHistoryData) // Initial call
      .mockResolvedValueOnce(updatedData); // After rating update

    (PostgresStorageProvider as jest.Mock).mockImplementation(() => ({
      getHistory: getHistorySpy,
      addHistory: jest.fn().mockResolvedValue({ id: "new-id", skipped: false }),
      deleteHistory: jest.fn().mockResolvedValue(true),
      updateResponseRating: updateRatingSpy,
    }));

    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Wait for initial history load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Click the rate button
    await act(async () => {
      screen.getByTestId("rate-button").click();
    });

    // Verify provider methods were called with correct parameters
    await waitFor(() => {
      expect(updateRatingSpy).toHaveBeenCalledWith("123", 0, {
        accuracy: true,
        relevance: true,
        completeness: true,
        concise: true,
        unbiased: true,
      });
    });
  });

  test("handles errors gracefully", async () => {
    // Create a specific error to match against
    const testError = new Error("Test error");

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Make the provider throw an error
    (PostgresStorageProvider as jest.Mock).mockImplementation(() => ({
      getHistory: jest.fn().mockRejectedValue(testError),
      addHistory: jest.fn(),
      deleteHistory: jest.fn(),
      updateResponseRating: jest.fn(),
    }));

    await act(async () => {
      render(
        <StorageProvider>
          <TestComponent />
        </StorageProvider>
      );
    });

    // Must wait a small amount of time for the error to be caught and logged
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);

    // History should be empty since error was thrown during load
    expect(screen.getByTestId("history-length").textContent).toBe("0");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("throws error when useStorage is used outside of StorageProvider", () => {
    // Suppress error output for this test
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Using a function that wraps the render call
    // This is important for catching errors properly
    const renderWithoutProvider = () => {
      render(<TestComponent />);
    };

    expect(renderWithoutProvider).toThrow(
      "useStorage must be used within a StorageProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
