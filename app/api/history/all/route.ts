import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function DELETE() {
  try {
    await executeQuery('DELETE FROM "QueryHistory"');
    return NextResponse.json({
      message: "All history items deleted",
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete all history items:", error);
    return NextResponse.json(
      { error: "Failed to delete all history items" },
      { status: 500 }
    );
  }
}
