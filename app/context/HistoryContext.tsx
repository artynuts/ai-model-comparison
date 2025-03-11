"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AIResponse } from "../types";

interface QueryHistory {
  query: string;
  timestamp: number;
  responses: AIResponse[];
}

interface HistoryContextType {
  history: QueryHistory[];
  addToHistory: (query: string, responses: AIResponse[]) => void;
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

  return (
    <HistoryContext.Provider value={{ history, addToHistory }}>
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
