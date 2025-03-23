import { LocalStorageProvider } from "../LocalStorageProvider";
import { AIResponse, ResponseRating } from "@/app/types";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock uuid to return predictable values
jest.mock("uuid", () => ({
  v4: jest
    .fn()
    .mockReturnValueOnce("mock-uuid-1")
    .mockReturnValueOnce("mock-uuid-2")
    .mockReturnValueOnce("mock-uuid-3")
    .mockReturnValueOnce("mock-uuid-4")
    .mockReturnValueOnce("mock-uuid-5"),
}));

describe("LocalStorageProvider", () => {
  let provider: LocalStorageProvider;

  beforeEach(() => {
    // Setup mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });

    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();

    provider = new LocalStorageProvider();
  });

  describe("getHistory", () => {
    it("returns an empty array when localStorage is empty", async () => {
      const result = await provider.getHistory();
      expect(result).toEqual([]);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("queryHistory");
    });

    it("returns parsed history from localStorage", async () => {
      const mockHistory = [
        {
          id: "test-id-1",
          query: "test query 1",
          timestamp: 1000,
          responses: [
            {
              id: "response-id-1",
              modelName: "test-model",
              provider: "Test Provider",
              version: "1.0",
              description: "Test Description",
              response: "test response",
              latency: 100,
            },
          ],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      const result = await provider.getHistory();
      expect(result).toEqual(mockHistory);
    });

    it("ensures IDs for history items and responses", async () => {
      const mockHistory = [
        {
          id: "", // Empty ID should be replaced
          query: "test query",
          timestamp: 1000,
          responses: [
            {
              id: "", // Empty ID should be replaced
              modelName: "test-model",
              provider: "Test Provider",
              version: "1.0",
              description: "Test Description",
              response: "test response",
              latency: 100,
            },
          ],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      const result = await provider.getHistory();

      expect(result[0].id).toBe("mock-uuid-1");
      expect(result[0].responses[0].id).toBe("mock-uuid-2");
    });
  });

  describe("addHistory", () => {
    it("adds a new history item with generated ID", async () => {
      const mockQuery = "test query";
      const mockResponses: AIResponse[] = [
        {
          id: "response-id",
          modelName: "test-model",
          provider: "Test Provider",
          version: "1.0",
          description: "Test Description",
          response: "test response",
          latency: 100,
        },
      ];

      // Mock Date.now() for consistent timestamp
      const mockTimestamp = 1000;
      jest.spyOn(Date, "now").mockReturnValueOnce(mockTimestamp);

      const result = await provider.addHistory(mockQuery, mockResponses);

      expect(result.id).toBe("mock-uuid-3");
      expect(result.skipped).toBe(false);

      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // Verify the item was added to history
      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toHaveLength(1);
      expect(historyArg[0]).toEqual({
        id: "mock-uuid-3",
        query: mockQuery,
        timestamp: mockTimestamp,
        responses: mockResponses,
      });
    });

    it("adds a new history item with provided ID", async () => {
      const mockQuery = "test query";
      const mockResponses: AIResponse[] = [
        {
          id: "response-id",
          modelName: "test-model",
          provider: "Test Provider",
          version: "1.0",
          description: "Test Description",
          response: "test response",
          latency: 100,
        },
      ];
      const mockId = "provided-id";
      const mockTimestamp = 2000;

      const result = await provider.addHistory(
        mockQuery,
        mockResponses,
        mockId,
        mockTimestamp
      );

      expect(result.id).toBe(mockId);
      expect(result.skipped).toBe(false);

      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // Verify the item was added to history
      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toHaveLength(1);
      expect(historyArg[0]).toEqual({
        id: mockId,
        query: mockQuery,
        timestamp: mockTimestamp,
        responses: mockResponses,
      });
    });

    it("trims whitespace from query", async () => {
      const mockQuery = "  test query with whitespace  ";
      const mockResponses: AIResponse[] = [];

      await provider.addHistory(mockQuery, mockResponses);

      // Verify the item was added to history with trimmed query
      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg[0].query).toBe("test query with whitespace");
    });

    it("skips adding duplicate items with same ID", async () => {
      const mockQuery = "test query";
      const mockResponses: AIResponse[] = [];
      const mockId = "duplicate-id";

      // Setup existing history with the same ID
      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify([
          {
            id: mockId,
            query: "existing query",
            timestamp: 1000,
            responses: [],
          },
        ])
      );

      const result = await provider.addHistory(
        mockQuery,
        mockResponses,
        mockId
      );

      expect(result.id).toBe(mockId);
      expect(result.skipped).toBe(true);

      // Verify localStorage was not updated (since item was skipped)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("deleteHistory", () => {
    it("removes an item from history by ID", async () => {
      // Setup existing history
      const mockHistory = [
        {
          id: "id-to-keep",
          query: "query 1",
          timestamp: 1000,
          responses: [],
        },
        {
          id: "id-to-delete",
          query: "query 2",
          timestamp: 2000,
          responses: [],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      await provider.deleteHistory("id-to-delete");

      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // Verify the item was removed from history
      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toHaveLength(1);
      expect(historyArg[0].id).toBe("id-to-keep");
    });

    it("does nothing if ID is not found", async () => {
      // Setup existing history
      const mockHistory = [
        {
          id: "existing-id",
          query: "query",
          timestamp: 1000,
          responses: [],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      await provider.deleteHistory("non-existent-id");

      // Verify localStorage was updated but with the same content
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toHaveLength(1);
      expect(historyArg[0].id).toBe("existing-id");
    });
  });

  describe("updateResponseRating", () => {
    it("updates the rating for a specific response", async () => {
      // Setup existing history with responses
      const mockHistory = [
        {
          id: "test-id",
          query: "test query",
          timestamp: 1000,
          responses: [
            {
              id: "response-1",
              modelName: "model-1",
              provider: "Provider 1",
              version: "1.0",
              description: "Description 1",
              response: "response 1",
              latency: 100,
            },
            {
              id: "response-2",
              modelName: "model-2",
              provider: "Provider 2",
              version: "2.0",
              description: "Description 2",
              response: "response 2",
              latency: 200,
            },
          ],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      const mockRating: ResponseRating = {
        accuracy: true,
        relevance: false,
        completeness: true,
        concise: false,
        unbiased: null,
      };

      await provider.updateResponseRating("test-id", 1, mockRating);

      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // Verify the rating was updated for the correct response
      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg[0].responses[1].rating).toEqual(mockRating);

      // Verify other response was not modified
      expect(historyArg[0].responses[0].rating).toBeUndefined();
    });

    it("does nothing if history item ID is not found", async () => {
      // Setup existing history
      const mockHistory = [
        {
          id: "existing-id",
          query: "query",
          timestamp: 1000,
          responses: [
            {
              id: "response-id",
              modelName: "model",
              response: "response",
              latency: 100,
            },
          ],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      const mockRating: ResponseRating = {
        accuracy: true,
        relevance: true,
        completeness: true,
        concise: true,
        unbiased: true,
      };

      await provider.updateResponseRating("non-existent-id", 0, mockRating);

      // Verify localStorage was updated but content is unchanged
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toEqual(mockHistory);
    });

    it("does nothing if response index is out of bounds", async () => {
      // Setup existing history
      const mockHistory = [
        {
          id: "test-id",
          query: "query",
          timestamp: 1000,
          responses: [
            {
              id: "response-id",
              modelName: "model",
              response: "response",
              latency: 100,
            },
          ],
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHistory));

      const mockRating: ResponseRating = {
        accuracy: true,
        relevance: true,
        completeness: true,
        concise: true,
        unbiased: true,
      };

      await provider.updateResponseRating("test-id", 1, mockRating); // Index 1 doesn't exist

      // Verify localStorage was updated but content is unchanged
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const historyArg = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(historyArg).toEqual(mockHistory);
    });
  });

  // Test browser vs. server environment handling
  describe("server-side rendering", () => {
    let originalWindow: Window;

    beforeEach(() => {
      originalWindow = global.window;
      // @ts-ignore - Simulate SSR environment
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it("returns empty array for getHistory in SSR", async () => {
      const result = await provider.getHistory();
      expect(result).toEqual([]);
    });

    it("does nothing for setStoredHistory in SSR", async () => {
      const mockQuery = "test query";
      const mockResponses: AIResponse[] = [];

      const result = await provider.addHistory(mockQuery, mockResponses);

      // ID should still be generated
      expect(result.id).toBeTruthy();
      expect(result.skipped).toBe(false);

      // But localStorage should not be called
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
