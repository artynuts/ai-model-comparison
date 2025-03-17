import { AIResponse, ResponseRating } from "@/app/types";
import { StorageProvider, HistoryItem } from "./StorageProvider";
import { v4 as uuidv4 } from "uuid";

const HISTORY_KEY = "queryHistory";

export class LocalStorageProvider implements StorageProvider {
  private getStoredHistory(): HistoryItem[] {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = localStorage.getItem(HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];

    // Ensure all history items and responses have valid IDs
    return history.map((item: HistoryItem) => ({
      ...item,
      id: !item.id || item.id.trim() === "" ? uuidv4() : item.id,
      responses: item.responses.map((response) => ({
        ...response,
        id: !response.id || response.id.trim() === "" ? uuidv4() : response.id,
      })),
    }));
  }

  private setStoredHistory(history: HistoryItem[]): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  async getHistory(): Promise<HistoryItem[]> {
    return this.getStoredHistory();
  }

  async addHistory(
    query: string,
    responses: AIResponse[],
    id?: string,
    timestamp?: number
  ): Promise<string> {
    const history = this.getStoredHistory();
    const newId = id || uuidv4();
    const newItem: HistoryItem = {
      id: newId,
      query,
      timestamp: timestamp || Date.now(),
      responses,
    };
    history.unshift(newItem);
    this.setStoredHistory(history);
    return newId;
  }

  async deleteHistory(id: string): Promise<void> {
    const history = this.getStoredHistory();
    const filtered = history.filter((item) => item.id !== id);
    this.setStoredHistory(filtered);
  }

  async updateResponseRating(
    id: string,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void> {
    const history = this.getStoredHistory();
    const updated = history.map((item) => {
      if (item.id === id && item.responses[responseIndex]) {
        return {
          ...item,
          responses: item.responses.map((response, index) =>
            index === responseIndex ? { ...response, rating } : response
          ),
        };
      }
      return item;
    });
    this.setStoredHistory(updated);
  }
}
