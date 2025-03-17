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
      'INSERT INTO "QueryHistory" (id, query, timestamp, responses) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO NOTHING RETURNING *',
      [id, query, timestamp, jsonResponses]
    );

    return NextResponse.json(history || { skipped: true });
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

// PUT update rating
export async function PUT(request: Request) {
  try {
    const { id, responseIndex, rating } = await request.json();

    // First, get the current history item
    const result = await executeQuery<QueryHistory>(
      'SELECT responses FROM "QueryHistory" WHERE id = $1',
      [id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: "History item not found" },
        { status: 404 }
      );
    }

    // Update the rating in the responses array
    const responses = result[0].responses;
    if (!responses[responseIndex]) {
      return NextResponse.json(
        { error: "Response index out of bounds" },
        { status: 400 }
      );
    }

    responses[responseIndex].rating = rating;

    // Update the history item with the new responses and update the updatedAt timestamp
    await executeQuery(
      'UPDATE "QueryHistory" SET responses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2',
      [JSON.stringify(responses), id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update rating:", error);
    return NextResponse.json(
      { error: "Failed to update rating" },
      { status: 500 }
    );
  }
}
