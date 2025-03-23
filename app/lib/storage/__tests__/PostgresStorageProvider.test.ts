import { PostgresStorageProvider } from "../PostgresStorageProvider";
import { AIResponse, ResponseRating } from "@/app/types";

// Mock global fetch
global.fetch = jest.fn();

// Helper to setup mock responses
const mockFetchResponse = (status: number, data: any) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

describe("PostgresStorageProvider", () => {
  let provider: PostgresStorageProvider;

  beforeEach(() => {
    provider = new PostgresStorageProvider();
    jest.clearAllMocks();
  });

  describe("getHistory", () => {
    it("fetches history successfully", async () => {
      const mockHistory = [
        { id: "1", query: "test", timestamp: 123456, responses: [] },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(200, mockHistory)
      );

      const result = await provider.getHistory();

      expect(global.fetch).toHaveBeenCalledWith("/api/history");
      expect(result).toEqual(mockHistory);
    });

    it("throws error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(500, { error: "Server error" })
      );

      await expect(provider.getHistory()).rejects.toThrow(
        "Failed to fetch history from PostgreSQL"
      );
    });
  });

  describe("addHistory", () => {
    it("adds history with provided ID", async () => {
      const query = "test query";
      const responses: AIResponse[] = [
        {
          modelName: "test",
          id: "test-id-response",
          provider: "Test Provider",
          version: "1.0",
          description: "Test Description",
          response: "response",
          latency: 100,
        },
      ];
      const id = "test-id";
      const timestamp = 123456789;

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(200, { id, skipped: false })
      );

      const result = await provider.addHistory(query, responses, id, timestamp);

      expect(global.fetch).toHaveBeenCalledWith("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, query, timestamp, responses }),
      });

      expect(result).toEqual({ id, skipped: false });
    });

    it("generates UUID when ID not provided", async () => {
      const query = "test query";
      const responses: AIResponse[] = [
        {
          modelName: "test",
          id: "test-id-response",
          provider: "Test Provider",
          version: "1.0",
          description: "Test Description",
          response: "response",
          latency: 100,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(200, { id: "generated-id", skipped: false })
      );

      const result = await provider.addHistory(query, responses);

      expect(global.fetch).toHaveBeenCalled();
      expect(result.id).toBeTruthy();
    });

    it("throws error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(500, { error: "Server error" })
      );

      await expect(provider.addHistory("query", [])).rejects.toThrow(
        "Failed to add history to PostgreSQL"
      );
    });
  });

  describe("deleteHistory", () => {
    it("deletes history successfully", async () => {
      const id = "test-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(200, { success: true })
      );

      await provider.deleteHistory(id);

      expect(global.fetch).toHaveBeenCalledWith(`/api/history?id=${id}`, {
        method: "DELETE",
      });
    });

    it("throws error when fetch fails", async () => {
      const id = "test-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(500, { error: "Server error" })
      );

      await expect(provider.deleteHistory(id)).rejects.toThrow(
        "Failed to delete history from PostgreSQL"
      );
    });
  });

  describe("updateResponseRating", () => {
    it("updates rating successfully", async () => {
      const id = "test-id";
      const responseIndex = 0;
      const rating: ResponseRating = {
        accuracy: true,
        relevance: true,
        completeness: true,
        concise: false,
        unbiased: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(200, { success: true })
      );

      await provider.updateResponseRating(id, responseIndex, rating);

      expect(global.fetch).toHaveBeenCalledWith("/api/history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, responseIndex, rating }),
      });
    });

    it("throws error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchResponse(500, { error: "Server error" })
      );

      const rating: ResponseRating = {
        accuracy: true,
        relevance: false,
        completeness: true,
        concise: true,
        unbiased: null,
      };

      await expect(
        provider.updateResponseRating("id", 0, rating)
      ).rejects.toThrow("Failed to update rating in PostgreSQL");
    });
  });
});
