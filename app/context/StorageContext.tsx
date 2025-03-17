"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  StorageProvider,
  HistoryItem,
} from "../lib/storage/StorageProvider";
import { PostgresStorageProvider } from "../lib/storage/PostgresStorageProvider";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { AIResponse, ResponseRating } from "../types";

type StorageType = "postgres" | "localStorage";

interface StorageContextType {
  storageType: StorageType;
  setStorageType: (type: StorageType) => void;
  history: HistoryItem[];
  addToHistory: (query: string, responses: AIResponse[]) => Promise<string>;
  deleteFromHistory: (id: string) => Promise<void>;
  updateResponseRating: (
    id: string,
    responseIndex: number,
    rating: ResponseRating
  ) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const STORAGE_TYPE_KEY = "preferred_storage";

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [storageType, setStorageType] = useState<StorageType>("postgres");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [provider, setProvider] = useState<StorageProvider>(
    new PostgresStorageProvider()
  );

  useEffect(() => {
    // Load preferred storage type from localStorage
    const savedType = localStorage.getItem(STORAGE_TYPE_KEY) as StorageType;
    if (savedType) {
      setStorageType(savedType);
    }
  }, []);

  useEffect(() => {
    // Update provider when storage type changes
    const newProvider =
      storageType === "postgres"
        ? new PostgresStorageProvider()
        : new LocalStorageProvider();
    setProvider(newProvider);

    // Save preference
    localStorage.setItem(STORAGE_TYPE_KEY, storageType);

    // Load history from new provider
    newProvider.getHistory().then(setHistory).catch(console.error);
  }, [storageType]);

  const addToHistory = async (query: string, responses: AIResponse[]) => {
    const id = await provider.addHistory(query, responses);
    const updatedHistory = await provider.getHistory();
    setHistory(updatedHistory);
    return id;
  };

  const deleteFromHistory = async (id: string) => {
    await provider.deleteHistory(id);
    const updatedHistory = await provider.getHistory();
    setHistory(updatedHistory);
  };

  const updateResponseRating = async (
    id: string,
    responseIndex: number,
    rating: ResponseRating
  ) => {
    await provider.updateResponseRating(id, responseIndex, rating);
    const updatedHistory = await provider.getHistory();
    setHistory(updatedHistory);
  };

  return (
    <StorageContext.Provider
      value={{
        storageType,
        setStorageType,
        history,
        addToHistory,
        deleteFromHistory,
        updateResponseRating,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
