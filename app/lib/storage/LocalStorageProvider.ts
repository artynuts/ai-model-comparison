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
    return stored ? JSON.parse(stored) : [];
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

  async addHistory(query: string, responses: AIResponse[]): Promise<void> {
    const history = this.getStoredHistory();
    const newItem: HistoryItem = {
      id: uuidv4(),
      query,
      timestamp: Date.now(),
      responses,
    };
    history.push(newItem);
    this.setStoredHistory(history);
  }

  async deleteHistory(timestamp: number): Promise<void> {
    const history = this.getStoredHistory();
    const filtered = history.filter((item) => item.timestamp !== timestamp);
    this.setStoredHistory(filtered);
  }

  async updateResponseRating(
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void> {
    const history = this.getStoredHistory();
    const updated = history.map((item) => {
      if (item.timestamp === timestamp && item.responses[responseIndex]) {
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
