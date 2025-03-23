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
    </div>
  );
}

describe("HistoryContext", () => {
  test("provides history data from the API", async () => {
    // Set up fetch mock for initial data load
    mockFetch(mockHistoryData);

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    );

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

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    );

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for add operation
    mockFetch({ success: true }); // For POST request

    // Set up fetch mock for updated data load after add
    const updatedMockHistory = [
      {
        query: "New query",
        timestamp: expect.any(Number),
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
    ];
    mockFetch(updatedMockHistory);

    // Click the add button
    act(() => {
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

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    );

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for delete operation
    mockFetch({ success: true }); // For DELETE request

    // Set up fetch mock for updated data load after delete
    mockFetch([mockHistoryData[1]]); // Return only the second item

    // Click the delete button
    act(() => {
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

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    );

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("2");
    });

    // Set up fetch mocks for rating update
    mockFetch({ success: true }); // For PUT request

    // Set up fetch mock for updated data load after rating
    const updatedMockHistory = [...mockHistoryData];
    (updatedMockHistory[0].responses[0] as AIResponse).rating = {
      accuracy: true,
      relevance: true,
      completeness: true,
      concise: true,
      unbiased: true,
    };
    mockFetch(updatedMockHistory);

    // Click the rate button
    act(() => {
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
  });

  test("handles API errors gracefully", async () => {
    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock API error
    mockFetch(null, 500);

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    );

    // The error is caught and handled internally
    await waitFor(() => {
      expect(screen.getByTestId("history-length").textContent).toBe("0");
    });

    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalledWith("/api/history");

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
});
