import { NextResponse } from "next/server";
import { PUT } from "../route";
import { prisma } from "@/lib/db";

// Mock prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    queryHistory: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe("History Rating API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT", () => {
    it("updates a rating successfully", async () => {
      // Mock request data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          timestamp: 123456789,
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      // Mock existing history item
      const mockHistoryItem = {
        id: "test-id",
        timestamp: BigInt(123456789),
        responses: [{ modelName: "Test Model", text: "Test response" }],
      };

      // Mock prisma findFirst result
      (prisma.queryHistory.findFirst as jest.Mock).mockResolvedValueOnce(
        mockHistoryItem
      );

      // Mock prisma updateMany result
      const mockUpdateResult = { count: 1 };
      (prisma.queryHistory.updateMany as jest.Mock).mockResolvedValueOnce(
        mockUpdateResult
      );

      // Call the PUT function
      const response = await PUT(mockRequest as unknown as Request);

      // Check if prisma.queryHistory.findFirst was called with correct arguments
      expect(prisma.queryHistory.findFirst).toHaveBeenCalledWith({
        where: {
          timestamp: BigInt(123456789),
        },
      });

      // Expected updated responses
      const expectedResponses = [
        {
          modelName: "Test Model",
          text: "Test response",
          rating: { accuracy: 5 },
        },
      ];

      // Check if prisma.queryHistory.updateMany was called with correct arguments
      expect(prisma.queryHistory.updateMany).toHaveBeenCalledWith({
        where: {
          timestamp: BigInt(123456789),
        },
        data: {
          responses: expectedResponses,
        },
      });

      // Check response
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdateResult);
    });

    it("handles history item not found", async () => {
      // Mock request data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          timestamp: 123456789,
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      // Mock prisma findFirst result (no item found)
      (prisma.queryHistory.findFirst as jest.Mock).mockResolvedValueOnce(null);

      // Call the PUT function
      const response = await PUT(mockRequest as unknown as Request);

      // Check response for not found case
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "History item not found" },
        { status: 404 }
      );
    });

    it("handles database errors", async () => {
      // Mock request data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          timestamp: 123456789,
          responseIndex: 0,
          rating: { accuracy: 5 },
        }),
      };

      // Mock prisma findFirst to throw error
      const error = new Error("Database error");
      (prisma.queryHistory.findFirst as jest.Mock).mockRejectedValueOnce(error);

      // Call the PUT function
      const response = await PUT(mockRequest as unknown as Request);

      // Check response for error case
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to update rating" },
        { status: 500 }
      );
    });
  });
});
