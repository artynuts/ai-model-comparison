import { render, screen, waitFor, act } from "@testing-library/react";
import { HistoryProvider, useHistory } from "../HistoryContext";
import { AIResponse, ResponseRating } from "../../types";

// Sample data for tests
const mockHistoryData = [
  {
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

// Mock fetch before tests
beforeEach(() => {
  // Clear all mocks
  global.fetch = jest.fn();
});

// Mock function to set up fetch responses
const mockFetch = (responseData: any, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValueOnce(responseData),
  });
};

// Mock function to set up fetch errors
const mockFetchError = (errorMessage: string) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
};

// Mock component to test the hook
function TestComponent() {
  const { history, addToHistory, deleteFromHistory, updateResponseRating } =
    useHistory();

  return (
    <div>
      <div data-testid="history-length">{history.length}</div>
      <div data-testid="first-query">{history[0]?.query}</div>
      <button
        data-testid="add-button"
        onClick={() =>
          addToHistory("New query", [
            {
              modelName: "Test Model",
              id: "new-resp",
              provider: "Test Provider",
              version: "1.0",
              description: "Test description",
              response: "Test response",
              latency: 150,
            },
          ])
        }
      >
        Add
      </button>
      <button
        data-testid="delete-button"
        onClick={() => deleteFromHistory(1234567890)}
      >
        Delete
      </button>
      <button
        data-testid="rate-button"
        onClick={() =>
          updateResponseRating(1234567890, 0, {
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

describe("HistoryContext", () => {
  test("provides history data from the API", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for the history to be fetched
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");
    expect(global.fetch).toHaveBeenCalledWith("/api/history");
  });

  test("adds a new item to history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for add operation
    mockFetch({ success: true }); // For POST request

    // Click the add button
    await act(async () => {
      screen.getByTestId("add-button").click();
    });

    // Wait for the history to update
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("3");
    });

    expect(screen.getByTestId("first-query").textContent).toBe("New query");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      })
    );
  });

  test("deletes an item from history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for delete operation
    mockFetch({ success: true }); // For DELETE request

    // Click the delete button
    await act(async () => {
      screen.getByTestId("delete-button").click();
    });

    // Wait for the history to update
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("1");
    });

    expect(screen.getByTestId("first-query").textContent).toBe("Test query 2");
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/history?timestamp=1234567890`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  test("updates a response rating", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for rating update
    mockFetch({ success: true }); // For PUT request

    // Click the rate button
    await act(async () => {
      screen.getByTestId("rate-button").click();
    });

    // Verify that the API calls were made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/history/rating",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        })
      );
    });

    // Verify the content of the request body
    const requestBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[1][1].body
    );
    expect(requestBody).toEqual({
      timestamp: 1234567890,
      responseIndex: 0,
      rating: {
        accuracy: true,
        relevance: true,
        completeness: true,
        concise: true,
        unbiased: true,
      },
    });
  });

  test("handles API errors gracefully during initial fetch", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock API error
    mockFetch(null, 500);

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // The error is caught and handled internally
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("0");
    });

    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalledWith("/api/history");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles network errors gracefully during initial fetch", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock network error
    mockFetchError("Network error");

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // The error is caught and handled internally
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("0");
    });

    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalledWith("/api/history");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles API error when adding to history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for add operation - with error
    mockFetch(null, 400);

    // Click the add button
    await act(async () => {
      screen.getByTestId("add-button").click();
    });

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error adding to history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles network error when adding to history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for add operation - with network error
    mockFetchError("Network error during add");

    // Click the add button
    await act(async () => {
      screen.getByTestId("add-button").click();
    });

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error adding to history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles API error when deleting from history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for delete operation - with error
    mockFetch(null, 400);

    // Click the delete button
    await act(async () => {
      screen.getByTestId("delete-button").click();
    });

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting from history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles network error when deleting from history", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for delete operation - with network error
    mockFetchError("Network error during delete");

    // Click the delete button
    await act(async () => {
      screen.getByTestId("delete-button").click();
    });

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting from history:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles API error when updating response rating", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for rating update - with error
    mockFetch(null, 400);

    // Click the rate button
    await act(async () => {
      screen.getByTestId("rate-button").click();
    });

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating rating:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("handles network error when updating response rating", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(
        <HistoryProvider>
          <TestComponent />
        </HistoryProvider>
      );
    });

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for rating update - with network error
    mockFetchError("Network error during rating update");

    // Click the rate button
    await act(async () => {
      screen.getByTestId("rate-button").click();
    });

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating rating:",
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test("throws error when useHistory is used outside of HistoryProvider", () => {
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
      "useHistory must be used within a HistoryProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
