import { AIResponse, ResponseRating } from "@/app/types";

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  responses: AIResponse[];
}

export interface StorageProvider {
  getHistory(): Promise<HistoryItem[]>;
  addHistory(
    query: string,
    responses: AIResponse[],
    id?: string,
    timestamp?: number
  ): Promise<string>;
  deleteHistory(id: string): Promise<void>;
  updateResponseRating(
    id: string,
    responseIndex: number,
    rating: ResponseRating
  ): Promise<void>;
}
