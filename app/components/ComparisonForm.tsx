"use client";

import { useState } from "react";
import { AIResponse, ComparisonState } from "../types";
import MarkdownResponse from "./MarkdownResponse";

interface QueryHistory {
  query: string;
  timestamp: number;
  responses: AIResponse[];
}

export default function ComparisonForm() {
  const [query, setQuery] = useState("");
  const [comparison, setComparison] = useState<ComparisonState>({
    isLoading: false,
    responses: [],
  });
  const [history, setHistory] = useState<QueryHistory[]>([]);

  const models = ["GPT-4", "Claude", "Gemini"];

  const compareModels = async (query: string): Promise<AIResponse[]> => {
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
            modelName: data.name,
            id: data.id,
            provider: data.provider,
            version: data.version,
            description: data.description,
            response: data.response,
            latency: Date.now() - startTime,
          };
        } catch (error) {
          return {
            modelName: model,
            id: model,
            provider: "Unknown",
            version: "Unknown",
            description: "Error occurred",
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

      // Add to history
      setHistory((prev) => [
        {
          query,
          timestamp: Date.now(),
          responses,
        },
        ...prev,
      ]);
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
              <div className="mb-4">
                <h3 className="font-bold text-lg">{response.modelName}</h3>
                <p className="text-sm text-gray-500">{response.provider}</p>
                <p className="text-xs text-gray-400 font-mono">
                  {response.version}
                </p>
                <p className="text-xs text-gray-400">{response.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Latency: {response.latency}ms
                </p>
              </div>
              {response.error ? (
                <p className="text-red-500">{response.error}</p>
              ) : (
                <MarkdownResponse content={response.response} />
              )}
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Query History</h2>
          <div className="space-y-8">
            {history.map((item, historyIndex) => (
              <div key={historyIndex} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono bg-gray-100 p-2 rounded">
                      {item.query}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuery(item.query);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Reuse Query
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.responses.map((response, responseIndex) => (
                    <div key={responseIndex} className="border rounded p-3">
                      <div className="mb-2">
                        <h4 className="font-semibold">{response.modelName}</h4>
                        <p className="text-xs text-gray-500">
                          {response.provider}
                        </p>
                        <p className="text-xs text-gray-400">
                          Latency: {response.latency}ms
                        </p>
                      </div>
                      {response.error ? (
                        <p className="text-red-500 text-sm">{response.error}</p>
                      ) : (
                        <div className="text-sm">
                          <MarkdownResponse content={response.response} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
