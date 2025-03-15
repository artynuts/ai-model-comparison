import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { timestamp, responseIndex, rating } = body;

    // First get the existing history item
    const historyItem = await prisma.queryHistory.findFirst({
      where: {
        timestamp: BigInt(timestamp),
      },
    });

    if (!historyItem) {
      return NextResponse.json(
        { error: "History item not found" },
        { status: 404 }
      );
    }

    // Update the rating in the responses array
    const responses = historyItem.responses as any[];
    responses[responseIndex] = { ...responses[responseIndex], rating };

    // Update the history item
    const updated = await prisma.queryHistory.updateMany({
      where: {
        timestamp: BigInt(timestamp),
      },
      data: {
        responses: responses,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update rating:", error);
    return NextResponse.json(
      { error: "Failed to update rating" },
      { status: 500 }
    );
  }
}
