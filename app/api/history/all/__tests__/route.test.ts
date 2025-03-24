import { NextResponse } from "next/server";
import { DELETE } from "../route";
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

describe("History All API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("DELETE", () => {
    it("deletes all history items", async () => {
      (db.executeQuery as jest.Mock).mockResolvedValueOnce([]);

      const response = await DELETE();

      expect(db.executeQuery).toHaveBeenCalledWith(
        'DELETE FROM "QueryHistory"'
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        message: "All history items deleted",
        success: true,
      });
    });

    it("handles database errors", async () => {
      const error = new Error("Database error");
      (db.executeQuery as jest.Mock).mockRejectedValueOnce(error);

      const response = await DELETE();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to delete all history items" },
        { status: 500 }
      );
    });
  });
});
