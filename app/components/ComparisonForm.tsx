"use client";

import { useState } from "react";
import { AIResponse, ComparisonState } from "../types";
import MarkdownResponse from "./MarkdownResponse";

export default function ComparisonForm() {
  const [query, setQuery] = useState("");
  const [comparison, setComparison] = useState<ComparisonState>({
    isLoading: false,
    responses: [],
  });

  const compareModels = async (query: string): Promise<AIResponse[]> => {
    const models = ["GPT-4", "Claude", "PaLM"];

    return Promise.all(
      models.map(async (model) => {
        const startTime = Date.now();

        try {
          const response = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, query }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `${model} request failed`);
          }

          const data = await response.json();
          return {
            modelName: model,
            response: data.response,
            latency: Date.now() - startTime,
          };
        } catch (error) {
          console.error(`${model} error:`, error);
          return {
            modelName: model,
            response: "",
            latency: Date.now() - startTime,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          };
        }
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setComparison((prev) => ({ ...prev, isLoading: true }));

    try {
      const responses = await compareModels(query);
      setComparison({ isLoading: false, responses });
    } catch (error) {
      console.error("Comparison failed:", error);
      setComparison({
        isLoading: false,
        responses: [],
      });
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparison.responses.map((response, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">{response.modelName}</h3>
              <p className="text-sm text-gray-500 mb-2">
                Latency: {response.latency}ms
              </p>
              {response.error ? (
                <p className="text-red-500">{response.error}</p>
              ) : (
                <MarkdownResponse content={response.response} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
