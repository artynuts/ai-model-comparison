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

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem("queryHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (query: string, responses: AIResponse[]) => {
    const newHistory = [
      { query, timestamp: Date.now(), responses },
      ...history,
    ];
    setHistory(newHistory);
    localStorage.setItem("queryHistory", JSON.stringify(newHistory));
  };

  const deleteFromHistory = (timestamp: number) => {
    const newHistory = history.filter((item) => item.timestamp !== timestamp);
    setHistory(newHistory);
    localStorage.setItem("queryHistory", JSON.stringify(newHistory));
  };

  const updateResponseRating = (
    timestamp: number,
    responseIndex: number,
    rating: ResponseRating
  ) => {
    const newHistory = history.map((item) => {
      if (item.timestamp === timestamp) {
        const newResponses = [...item.responses];
        newResponses[responseIndex] = {
          ...newResponses[responseIndex],
          rating,
        };
        return { ...item, responses: newResponses };
      }
      return item;
    });
    setHistory(newHistory);
    localStorage.setItem("queryHistory", JSON.stringify(newHistory));
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
