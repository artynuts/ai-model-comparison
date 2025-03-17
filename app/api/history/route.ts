import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  responses: any[];
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
    const { id, query, timestamp, responses } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Ensure responses is properly stringified for PostgreSQL JSONB
    const jsonResponses = JSON.stringify(responses);

    const [history] = await executeQuery<QueryHistory>(
      'INSERT INTO "QueryHistory" (id, query, timestamp, responses) VALUES ($1, $2, $3, $4::jsonb) RETURNING *',
      [id, query, timestamp, jsonResponses]
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await executeQuery('DELETE FROM "QueryHistory" WHERE id = $1', [id]);
    return NextResponse.json({
      message: "History item deleted",
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
