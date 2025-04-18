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
  id: string;
}

export default function ComparisonForm() {
  const [query, setQuery] = useState("");
  const [comparison, setComparison] = useState<ComparisonState>({
    isLoading: false,
    responses: [],
    timestamp: 0,
    id: "",
  });
  const { addToHistory, updateResponseRating } = useStorage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setComparison((prev) => ({ ...prev, isLoading: true }));

    try {
      const responses = await compareModels(query);
      const timestamp = Date.now();
      const result = await addToHistory(query, responses);
      setComparison({ isLoading: false, responses, timestamp, id: result.id });
    } catch (error) {
      console.error("Comparison failed:", error);
      setComparison({
        isLoading: false,
        responses: [],
        timestamp: 0,
        id: "",
      });
    }
  };

  const handleRatingChange = (index: number, rating: AIResponse["rating"]) => {
    if (!comparison.id || !rating) return;

    setComparison((prev) => {
      const newResponses = [...prev.responses];
      newResponses[index] = {
        ...newResponses[index],
        rating,
      };
      return { ...prev, responses: newResponses };
    });

    // Also update the rating in history
    updateResponseRating(comparison.id, index, rating);
  };

  return (
    <div className="w-full max-w-6xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-testid="comparison-form"
      >
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 bg-white border-standard rounded-lg h-32"
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
            id={comparison.id}
            responses={comparison.responses}
            onRatingChange={handleRatingChange}
          />
        </div>
      )}
    </div>
  );
}
