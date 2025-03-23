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
      <button
        data-testid="rate-button-different-timestamp"
        onClick={() =>
          updateResponseRating(9999, 0, {
            accuracy: true,
            relevance: true,
            completeness: true,
            concise: true,
            unbiased: true,
          })
        }
      >
        Rate Different
      </button>
    </div>
  );
}

describe("HistoryContext", () => {
  test("provides history data from the API", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    // Wrap render in act to handle any state updates
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

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      })
    );

    // Check that local state was updated with the new item
    expect(screen.getByTestId("history-length").textContent).toBe("3");
    expect(screen.getByTestId("first-query").textContent).toBe("New query");
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

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/history?timestamp=1234567890`,
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // Check that local state was updated with the item removed
    expect(screen.getByTestId("history-length").textContent).toBe("1");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 2");
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

    // Verify that the API calls were made with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history/rating",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("1234567890"),
      })
    );
  });

  test("handles API errors gracefully when fetching history", async () => {
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

    // Verify error was logged with the correct message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching history:",
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

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useHistory must be used within a HistoryProvider");

    consoleErrorSpy.mockRestore();
  });

  // Additional tests for branch coverage

  test("handles API error when adding to history", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

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

    // Mock failed API response for add operation
    mockFetch(null, 500);

    // Click the add button
    await act(async () => {
      screen.getByTestId("add-button").click();
    });

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      })
    );

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");

    // Verify error was logged with the correct message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error adding to history:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test("handles API error when deleting from history", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

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

    // Mock failed API response for delete operation
    mockFetch(null, 500);

    // Click the delete button
    await act(async () => {
      screen.getByTestId("delete-button").click();
    });

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/history?timestamp=1234567890`,
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // History should remain unchanged
    expect(screen.getByTestId("history-length").textContent).toBe("2");

    // Verify error was logged with the correct message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting from history:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test("handles API error when updating rating", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

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

    // Mock failed API response for rating update
    mockFetch(null, 500);

    // Click the rate button
    await act(async () => {
      screen.getByTestId("rate-button").click();
    });

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history/rating",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      })
    );

    // Verify error was logged with the correct message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating rating:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test("handles item not found when updating rating", async () => {
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

    // Set up fetch mocks for rating update - successful but for non-existent timestamp
    mockFetch({ success: true });

    // Click the rate button for a timestamp that doesn't exist in history
    await act(async () => {
      screen.getByTestId("rate-button-different-timestamp").click();
    });

    // Verify that the API call was made
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/history/rating",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("9999"),
      })
    );

    // No changes should be made to the history
    expect(screen.getByTestId("history-length").textContent).toBe("2");
    expect(screen.getByTestId("first-query").textContent).toBe("Test query 1");
  });
});
