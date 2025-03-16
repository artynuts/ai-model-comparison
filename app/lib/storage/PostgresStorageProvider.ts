import { AIResponse, ResponseRating } from "@/app/types";
import { StorageProvider, HistoryItem } from "./StorageProvider";

export class PostgresStorageProvider implements StorageProvider {
  async getHistory(): Promise<HistoryItem[]> {
    const response = await fetch("/api/history");
    if (!response.ok) {
      throw new Error("Failed to fetch history from PostgreSQL");
    }
    return response.json();
  }

  async addHistory(query: string, responses: AIResponse[]): Promise<void> {
    const response = await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, responses }),
    });

    if (!response.ok) {
      throw new Error("Failed to add history to PostgreSQL");
    }
  }

  async deleteHistory(timestamp: number): Promise<void> {
    const response = await fetch(`/api/history/${timestamp}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete history from PostgreSQL");
    }
  }

  async updateResponseRating(
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void> {
    const response = await fetch(`/api/history/${timestamp}/rating`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responseIndex, rating }),
    });

    if (!response.ok) {
      throw new Error("Failed to update rating in PostgreSQL");
    }
  }
}
