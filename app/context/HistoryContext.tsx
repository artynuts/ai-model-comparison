"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AIResponse, ResponseRating } from "../types";

interface QueryHistory {
  query: string;
  timestamp: number;
  responses: AIResponse[];
}

interface HistoryContextType {
  history: QueryHistory[];
  addToHistory: (query: string, responses: AIResponse[]) => void;
  deleteFromHistory: (timestamp: number) => void;
  updateResponseRating: (
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<QueryHistory[]>([]);

  // Load history from API on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const addToHistory = async (query: string, responses: AIResponse[]) => {
    const timestamp = Date.now();
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, timestamp, responses }),
      });

      if (!response.ok) throw new Error("Failed to add to history");

      setHistory((prev) => [{ query, timestamp, responses }, ...prev]);
    } catch (error) {
      console.error("Error adding to history:", error);
    }
  };

  const deleteFromHistory = async (timestamp: number) => {
    try {
      const response = await fetch(`/api/history?timestamp=${timestamp}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete from history");

      setHistory((prev) => prev.filter((item) => item.timestamp !== timestamp));
    } catch (error) {
      console.error("Error deleting from history:", error);
    }
  };

  const updateResponseRating = async (
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ) => {
    try {
      const response = await fetch("/api/history/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp, responseIndex, rating }),
      });

      if (!response.ok) throw new Error("Failed to update rating");

      setHistory((prev) =>
        prev.map((item) => {
          if (item.timestamp === timestamp) {
            const newResponses = [...item.responses];
            newResponses[responseIndex] = {
              ...newResponses[responseIndex],
              rating,
            };
            return { ...item, responses: newResponses };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <HistoryContext.Provider
      value={{ history, addToHistory, deleteFromHistory, updateResponseRating }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
