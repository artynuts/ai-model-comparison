import { AIResponse, ResponseRating } from "@/app/types";
import { StorageProvider, HistoryItem } from "./StorageProvider";
import { v4 as uuidv4 } from "uuid";

export class PostgresStorageProvider implements StorageProvider {
  async getHistory(): Promise<HistoryItem[]> {
    const response = await fetch("/api/history");
    if (!response.ok) {
      throw new Error("Failed to fetch history from PostgreSQL");
    }
    return response.json();
  }

  async addHistory(
    query: string,
    responses: AIResponse[],
    id?: string,
    timestamp?: number
  ): Promise<{ id: string; skipped: boolean }> {
    const newId = id || uuidv4();
    const response = await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newId,
        query,
        timestamp: timestamp || Date.now(),
        responses,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add history to PostgreSQL");
    }

    const result = await response.json();
    return { id: newId, skipped: result.skipped || false };
  }

  async deleteHistory(id: string): Promise<void> {
    const response = await fetch(`/api/history?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete history from PostgreSQL");
    }
  }

  async updateResponseRating(
    id: string,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void> {
    const response = await fetch("/api/history", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        responseIndex,
        rating,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update rating in PostgreSQL");
    }
  }
}
