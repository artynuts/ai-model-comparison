import { NextResponse } from "next/server";
import { POST } from "../route";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock the AI service libraries
jest.mock("openai", () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  };
  return jest.fn(() => mockOpenAI);
});

jest.mock("@anthropic-ai/sdk", () => {
  const mockAnthropic = {
    messages: {
      create: jest.fn(),
    },
  };
  return jest.fn(() => mockAnthropic);
});

jest.mock("@google/generative-ai", () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
  }));

  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe("Ask API Route", () => {
  let openaiMock: any;
  let anthropicMock: any;
  let genAIMock: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get instances from the mocked constructors
    openaiMock = new OpenAI({} as any);
    anthropicMock = new Anthropic({} as any);
    genAIMock = new GoogleGenerativeAI("");

    // Reset the mock implementations
    openaiMock.chat.completions.create.mockReset();
    anthropicMock.messages.create.mockReset();
  });

  describe("POST", () => {
    it("handles GPT-4 model requests", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          model: "GPT-4",
          query: "What is AI?",
        }),
      };

      // Set up OpenAI mock implementation
      openaiMock.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "AI is artificial intelligence.",
            },
          },
        ],
      });

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        response: "AI is artificial intelligence.",
        id: "GPT-4",
        name: "GPT-4",
        provider: "OpenAI",
        version: "gpt-4",
        description: "Most capable OpenAI model",
      });
    });

    it("handles Claude model requests", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          model: "Claude",
          query: "What is AI?",
        }),
      };

      // Set up Anthropic mock implementation
      anthropicMock.messages.create.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: "AI is a field of computer science.",
          },
        ],
      });

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        response: "AI is a field of computer science.",
        id: "Claude",
        name: "Claude 3 Opus",
        provider: "Anthropic",
        version: "claude-3-opus-20240229",
        description: "Latest Claude model",
      });
    });

    it("handles Gemini model requests", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          model: "Gemini",
          query: "What is AI?",
        }),
      };

      // Set up Gemini mock
      const mockResponseText =
        "AI refers to computer systems designed to mimic human intelligence.";
      const mockResponse = {
        text: jest.fn().mockReturnValue(mockResponseText),
      };

      const mockModelResult = {
        response: mockResponse,
      };

      // Access the generateContent mock through the mocked instance
      const generativeModelMock = genAIMock.getGenerativeModel();
      generativeModelMock.generateContent.mockResolvedValueOnce(
        mockModelResult
      );

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        response: mockResponseText,
        id: "Gemini",
        name: "Gemini Flash",
        provider: "Google",
        version: "gemini-2.0-flash",
        description: "Quick response model",
      });
    });

    it("handles unsupported model requests", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          model: "UnsupportedModel",
          query: "What is AI?",
        }),
      };

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Model not supported" },
        { status: 400 }
      );
    });

    it("handles API errors", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          model: "GPT-4",
          query: "What is AI?",
        }),
      };

      // Mock OpenAI error
      const errorMessage = "API error";
      openaiMock.chat.completions.create.mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: errorMessage },
        { status: 500 }
      );
    });
  });
});
