"use client";

import { useState } from "react";
import { compareModels } from "../lib/api";
import { AIResponse } from "../types";
import QueryGroup from "./QueryGroup";
import { useStorage } from "../context/StorageContext";

interface ComparisonState {
  isLoading: boolean;
  responses: AIResponse[];
  timestamp: number;
}

export default function ComparisonForm() {
  const [query, setQuery] = useState("");
  const [comparison, setComparison] = useState<ComparisonState>({
    isLoading: false,
    responses: [],
    timestamp: 0,
  });
  const { addToHistory, updateResponseRating } = useStorage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setComparison((prev) => ({ ...prev, isLoading: true }));

    try {
      const responses = await compareModels(query);
      const timestamp = Date.now();
      setComparison({ isLoading: false, responses, timestamp });
      addToHistory(query, responses);
    } catch (error) {
      console.error("Comparison failed:", error);
      setComparison({
        isLoading: false,
        responses: [],
        timestamp: 0,
      });
    }
  };

  const handleRatingChange = (index: number, rating: AIResponse["rating"]) => {
    if (!comparison.timestamp || !rating) return;

    setComparison((prev) => {
      const newResponses = [...prev.responses];
      newResponses[index] = {
        ...newResponses[index],
        rating,
      };
      return { ...prev, responses: newResponses };
    });

    // Also update the rating in history
    updateResponseRating(comparison.timestamp, index, rating);
  };

  return (
    <div className="w-full max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-lg h-32"
            placeholder="Enter your query here..."
          />
        </div>
        <button
          type="submit"
          disabled={comparison.isLoading || !query.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {comparison.isLoading ? "Comparing..." : "Compare Models"}
        </button>
      </form>

      {comparison.responses.length > 0 && (
        <div className="mt-8">
          <QueryGroup
            query={query}
            timestamp={comparison.timestamp}
            responses={comparison.responses}
            onRatingChange={handleRatingChange}
          />
        </div>
      )}
    </div>
  );
}
