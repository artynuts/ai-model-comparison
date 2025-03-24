import { NextResponse } from "next/server";
import { GET, POST, DELETE, PUT } from "../route";
import * as db from "@/lib/db";

// Mock the database module
jest.mock("@/lib/db", () => ({
  executeQuery: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// Mock console.error to prevent actual logging during tests
jest.spyOn(console, "error").mockImplementation(() => {});

// Define interface for the response object
interface ResponseItem {
  text: string;
  modelName: string;
  rating?: { accuracy: number } | undefined;
}

describe("History API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns all history items", async () => {
      const mockHistory = [
        { id: "1", query: "test query", timestamp: 123456, responses: [] },
      ];

      (db.executeQuery as jest.Mock).mockResolvedValueOnce(mockHistory);

      const response = await GET();

      expect(db.executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM "QueryHistory" ORDER BY timestamp DESC'
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockHistory);
    });

    it("handles database errors", async () => {
      const error = new Error("Database error");
      (db.executeQuery as jest.Mock).mockRejectedValueOnce(error);

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    });
  });

  describe("POST", () => {
    it("creates a new history item", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          query: "test query",
          timestamp: 123456,
          responses: [{ text: "response" }],
        }),
      };

      const mockHistoryItem = {
        id: "test-id",
        query: "test query",
        timestamp: 123456,
        responses: [{ text: "response" }],
      };

      (db.executeQuery as jest.Mock).mockResolvedValueOnce([mockHistoryItem]);

      const response = await POST(mockRequest as unknown as Request);

      expect(db.executeQuery).toHaveBeenCalledWith(
        'INSERT INTO "QueryHistory" (id, query, timestamp, responses) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO UPDATE SET query = EXCLUDED.query, timestamp = EXCLUDED.timestamp, responses = EXCLUDED.responses, "updatedAt" = NOW() RETURNING *',
        [
          "test-id",
          "test query",
          123456,
          JSON.stringify([{ text: "response" }]),
        ]
      );

      expect(NextResponse.json).toHaveBeenCalledWith(mockHistoryItem);
    });

    it("handles missing ID", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          query: "test query",
          timestamp: 123456,
          responses: [],
        }),
      };

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "ID is required" },
        { status: 400 }
      );
    });

    it("handles database errors", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          query: "test query",
          timestamp: 123456,
          responses: [],
        }),
      };

      const error = new Error("Database error");
      (db.executeQuery as jest.Mock).mockRejectedValueOnce(error);

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to create history item" },
        { status: 500 }
      );
    });

    it("handles creating a history item successfully", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          query: "test query",
          timestamp: 1234567890,
          responses: [{ text: "response" }],
        }),
      };

      (db.executeQuery as jest.Mock).mockResolvedValueOnce([
        {
          id: "test-id",
          query: "test query",
          timestamp: 1234567890,
          responses: [{ text: "response" }],
        },
      ]);

      const response = await POST(mockRequest as unknown as Request);

      expect(db.executeQuery).toHaveBeenCalledWith(
        'INSERT INTO "QueryHistory" (id, query, timestamp, responses) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO UPDATE SET query = EXCLUDED.query, timestamp = EXCLUDED.timestamp, responses = EXCLUDED.responses, "updatedAt" = NOW() RETURNING *',
        [
          "test-id",
          "test query",
          1234567890,
          JSON.stringify([{ text: "response" }]),
        ]
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        id: "test-id",
        query: "test query",
        timestamp: 1234567890,
        responses: [{ text: "response" }],
      });
    });

    it("handles creating a history item when no rows are returned", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          query: "test query",
          timestamp: 1234567890,
          responses: [{ text: "response" }],
        }),
      };

      // Mock empty result array
      (db.executeQuery as jest.Mock).mockResolvedValueOnce([]);

      const response = await POST(mockRequest as unknown as Request);

      expect(db.executeQuery).toHaveBeenCalledWith(
        'INSERT INTO "QueryHistory" (id, query, timestamp, responses) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO UPDATE SET query = EXCLUDED.query, timestamp = EXCLUDED.timestamp, responses = EXCLUDED.responses, "updatedAt" = NOW() RETURNING *',
        [
          "test-id",
          "test query",
          1234567890,
          JSON.stringify([{ text: "response" }]),
        ]
      );

      expect(NextResponse.json).toHaveBeenCalledWith({ skipped: true });
    });

    it("handles missing ID in POST request", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          query: "test query",
          timestamp: 123456,
          responses: [],
        }),
      };

      const response = await POST(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "ID is required" },
        { status: 400 }
      );
    });
  });

  describe("DELETE", () => {
    it("deletes a history item", async () => {
      const mockUrl = "http://localhost:3000/api/history?id=test-id";
      const mockRequest = {
        url: mockUrl,
      };

      const response = await DELETE(mockRequest as unknown as Request);

      expect(db.executeQuery).toHaveBeenCalledWith(
        'DELETE FROM "QueryHistory" WHERE id = $1',
        ["test-id"]
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        message: "History item deleted",
        success: true,
      });
    });

    it("handles missing ID", async () => {
      const mockUrl = "http://localhost:3000/api/history";
      const mockRequest = {
        url: mockUrl,
      };

      const response = await DELETE(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "ID is required" },
        { status: 400 }
      );
    });

    it("handles database errors", async () => {
      const mockUrl = "http://localhost:3000/api/history?id=test-id";
      const mockRequest = {
        url: mockUrl,
      };

      const error = new Error("Database error");
      (db.executeQuery as jest.Mock).mockRejectedValueOnce(error);

      const response = await DELETE(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to delete history item" },
        { status: 500 }
      );
    });
  });

  describe("PUT", () => {
    it("updates a response rating", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      const mockResponses = [{ text: "response", modelName: "test-model" }];

      (db.executeQuery as jest.Mock).mockResolvedValueOnce([
        { responses: mockResponses },
      ]);

      const response = await PUT(mockRequest as unknown as Request);

      // First query to get the current history item
      expect(db.executeQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT responses FROM "QueryHistory" WHERE id = $1',
        ["test-id"]
      );

      // Second query to update the rating
      const updatedResponses = [...mockResponses] as ResponseItem[];
      updatedResponses[0] = {
        ...updatedResponses[0],
        rating: { accuracy: 5 },
      };

      expect(db.executeQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE "QueryHistory" SET responses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2',
        [JSON.stringify(updatedResponses), "test-id"]
      );

      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it("handles history item not found", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      (db.executeQuery as jest.Mock).mockResolvedValueOnce([]);

      const response = await PUT(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "History item not found" },
        { status: 404 }
      );
    });

    it("handles response index out of bounds", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          responseIndex: 1, // Out of bounds
          rating: { accuracy: 5 },
        }),
      };

      (db.executeQuery as jest.Mock).mockResolvedValueOnce([
        { responses: [{ text: "response" }] },
      ]);

      const response = await PUT(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Response index out of bounds" },
        { status: 400 }
      );
    });

    it("handles database errors", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      const error = new Error("Database error");
      (db.executeQuery as jest.Mock).mockRejectedValueOnce(error);

      const response = await PUT(mockRequest as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to update rating" },
        { status: 500 }
      );
    });

    it("handles updating rating successfully", async () => {
      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          id: "test-id",
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      // Type-safe response array with correct interface
      const mockResponses: Array<{
        text: string;
        modelName: string;
        rating?: any;
      }> = [
        {
          text: "response",
          modelName: "test-model",
        },
      ];

      // Mock the database response
      (db.executeQuery as jest.Mock).mockResolvedValueOnce([
        { responses: mockResponses },
      ]);

      // Call the PUT function
      await PUT(mockRequest as unknown as Request);

      // Verify the first query
      expect(db.executeQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT responses FROM "QueryHistory" WHERE id = $1',
        ["test-id"]
      );

      // Create the expected updated responses array
      const expectedUpdatedResponses = [
        {
          text: "response",
          modelName: "test-model",
          rating: { accuracy: 5 },
        },
      ];

      // Verify the second query
      expect(db.executeQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE "QueryHistory" SET responses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2',
        [JSON.stringify(expectedUpdatedResponses), "test-id"]
      );

      // Verify the response
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
