import { compareModels } from "../api";

// Mock fetch but not the entire module
global.fetch = jest.fn();

describe("API utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("compareModels", () => {
    it("successfully fetches responses from all models", async () => {
      // Keep a reference to the original Date.now
      const originalDateNow = Date.now;

      // Mock Date.now to return a fixed value
      Date.now = jest.fn().mockReturnValue(1000);

      // Mock successful fetch responses for all models
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "GPT-4",
                id: "gpt-id",
                provider: "OpenAI",
                version: "4.0",
                description: "Advanced language model",
                response: "GPT-4 response",
              }),
          })
        )
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "Claude",
                id: "claude-id",
                provider: "Anthropic",
                version: "3.0",
                description: "Helpful assistant",
                response: "Claude response",
              }),
          })
        )
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "Gemini",
                id: "gemini-id",
                provider: "Google",
                version: "1.0",
                description: "Multimodal AI",
                response: "Gemini response",
              }),
          })
        );

      const query = "Test query";
      const results = await compareModels(query);

      // Restore original Date.now
      Date.now = originalDateNow;

      // Verify fetch was called for each model
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Verify each call to fetch
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "GPT-4", query }),
      });

      expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "Claude", query }),
      });

      expect(global.fetch).toHaveBeenNthCalledWith(3, "/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "Gemini", query }),
      });

      // Verify the returned responses
      expect(results).toHaveLength(3);

      // Since Date.now always returns 1000, latency will be 0
      expect(results[0].latency).toBe(0);
      expect(results[1].latency).toBe(0);
      expect(results[2].latency).toBe(0);

      // Verify all other fields match expected values
      expect(results[0]).toMatchObject({
        modelName: "GPT-4",
        id: "gpt-id",
        provider: "OpenAI",
        version: "4.0",
        description: "Advanced language model",
        response: "GPT-4 response",
      });

      expect(results[1]).toMatchObject({
        modelName: "Claude",
        id: "claude-id",
        provider: "Anthropic",
        version: "3.0",
        description: "Helpful assistant",
        response: "Claude response",
      });

      expect(results[2]).toMatchObject({
        modelName: "Gemini",
        id: "gemini-id",
        provider: "Google",
        version: "1.0",
        description: "Multimodal AI",
        response: "Gemini response",
      });
    });

    it("handles failed fetch responses gracefully", async () => {
      // Keep a reference to the original Date.now
      const originalDateNow = Date.now;

      // Mock Date.now to return a fixed value
      Date.now = jest.fn().mockReturnValue(1000);

      // Mock responses including one error
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "GPT-4",
                id: "gpt-id",
                provider: "OpenAI",
                version: "4.0",
                description: "Advanced language model",
                response: "GPT-4 response",
              }),
          })
        )
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({
                error: "Service unavailable",
              }),
          })
        )
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "Gemini",
                id: "gemini-id",
                provider: "Google",
                version: "1.0",
                description: "Multimodal AI",
                response: "Gemini response",
              }),
          })
        );

      const query = "Test query";
      const results = await compareModels(query);

      // Restore original Date.now
      Date.now = originalDateNow;

      // Verify the returned responses, including error for Claude
      expect(results).toHaveLength(3);

      // Instead of asserting the exact value of latency,
      // assert that latency exists and is 0 (since our mock returns the same value)
      expect(results[0].latency).toBe(0);
      expect(results[1].latency).toBe(0);
      expect(results[2].latency).toBe(0);

      // Verify all other fields match expected values
      expect(results[0]).toMatchObject({
        modelName: "GPT-4",
        id: "gpt-id",
        provider: "OpenAI",
        version: "4.0",
        description: "Advanced language model",
        response: "GPT-4 response",
      });

      expect(results[1]).toMatchObject({
        modelName: "Claude",
        id: "Claude",
        provider: "Unknown",
        version: "Unknown",
        description: "Error occurred",
        response: "",
        error: "Service unavailable",
      });

      expect(results[2]).toMatchObject({
        modelName: "Gemini",
        id: "gemini-id",
        provider: "Google",
        version: "1.0",
        description: "Multimodal AI",
        response: "Gemini response",
      });
    });

    it("handles network errors during fetch", async () => {
      // Keep a reference to the original Date.now
      const originalDateNow = Date.now;

      // Mock Date.now to return a fixed value
      Date.now = jest.fn().mockReturnValue(1000);

      // Mock a network error for the first model
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "Claude",
                id: "claude-id",
                provider: "Anthropic",
                version: "3.0",
                description: "Helpful assistant",
                response: "Claude response",
              }),
          })
        )
        .mockResolvedValueOnce(
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "Gemini",
                id: "gemini-id",
                provider: "Google",
                version: "1.0",
                description: "Multimodal AI",
                response: "Gemini response",
              }),
          })
        );

      const query = "Test query";
      const results = await compareModels(query);

      // Restore original Date.now
      Date.now = originalDateNow;

      // Verify error handling for the first model
      expect(results[0]).toMatchObject({
        modelName: "GPT-4",
        id: "GPT-4",
        provider: "Unknown",
        version: "Unknown",
        description: "Error occurred",
        response: "",
        error: "Network error",
      });

      // The latency should be 0 since our mock returns the same timestamp
      expect(results[0].latency).toBe(0);

      // Verify the other models still processed correctly
      expect(results).toHaveLength(3);
    });
  });
});
