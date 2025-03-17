import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  responses: any;
  created_at: Date;
  updated_at: Date;
}

// GET all history items
export async function GET() {
  try {
    const history = await executeQuery<QueryHistory>(
      'SELECT * FROM "QueryHistory" ORDER BY timestamp DESC'
    );
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

// POST new history item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, timestamp, responses } = body;

    // Ensure responses is properly stringified for PostgreSQL JSONB
    const jsonResponses = JSON.stringify(responses);

    const [history] = await executeQuery<QueryHistory>(
      'INSERT INTO "QueryHistory" (query, timestamp, responses) VALUES ($1, $2, $3::jsonb) RETURNING *',
      [query, timestamp, jsonResponses]
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to create history item:", error);
    return NextResponse.json(
      { error: "Failed to create history item" },
      { status: 500 }
    );
  }
}

// DELETE history item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get("timestamp");

    if (!timestamp) {
      return NextResponse.json(
        { error: "Timestamp is required" },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM "QueryHistory" WHERE timestamp = $1', [
      timestamp,
    ]);

    return NextResponse.json({ message: "History item deleted" });
  } catch (error) {
    console.error("Failed to delete history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
