import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all history items
export async function GET() {
  try {
    const history = await prisma.queryHistory.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });
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

    const history = await prisma.queryHistory.create({
      data: {
        query,
        timestamp,
        responses,
      },
    });

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

    await prisma.queryHistory.deleteMany({
      where: {
        timestamp: BigInt(timestamp),
      },
    });

    return NextResponse.json({ message: "History item deleted" });
  } catch (error) {
    console.error("Failed to delete history item:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
