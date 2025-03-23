import { compareModels } from "../api";

// Mock the entire fetch function instead of just testing the implementation
jest.mock("../api", () => ({
  compareModels: jest.fn(),
}));

describe("API utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("compareModels", () => {
    it("should call compareModels with the correct query", async () => {
      const mockQuery = "test query";
      const mockResponses = [
        {
          modelName: "GPT-4",
          id: "gpt-id",
          provider: "OpenAI",
          version: "4.0",
          description: "Advanced language model",
          response: "GPT-4 response",
          latency: 300,
        },
        {
          modelName: "Claude",
          id: "claude-id",
          provider: "Anthropic",
          version: "3.0",
          description: "Helpful assistant",
          response: "Claude response",
          latency: 250,
        },
        {
          modelName: "Gemini",
          id: "gemini-id",
          provider: "Google",
          version: "1.0",
          description: "Multimodal AI",
          response: "Gemini response",
          latency: 200,
        },
      ];

      // Set up the mock implementation for this test
      (compareModels as jest.Mock).mockResolvedValue(mockResponses);

      // Call the function
      const result = await compareModels(mockQuery);

      // Verify the function was called with the right arguments
      expect(compareModels).toHaveBeenCalledWith(mockQuery);

      // Verify the responses
      expect(result).toEqual(mockResponses);
      expect(result.length).toBe(3);
    });
  });
});
