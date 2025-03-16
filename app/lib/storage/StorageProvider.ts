import { AIResponse, ResponseRating } from "@/app/types";

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  responses: AIResponse[];
}

export interface StorageProvider {
  getHistory(): Promise<HistoryItem[]>;
  addHistory(query: string, responses: AIResponse[]): Promise<void>;
  deleteHistory(timestamp: number): Promise<void>;
  updateResponseRating(
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void>;
}
