"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import MarkdownResponse from "../components/MarkdownResponse";
import { useHistory } from "../context/HistoryContext";

export default function History() {
  const searchParams = useSearchParams();
  const selectedQuery = searchParams.get("query");
  const { history, deleteFromHistory } = useHistory();
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedQuery && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedQuery]);

  const handleDelete = (timestamp: number) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      deleteFromHistory(timestamp);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Query History</h1>

      <div className="space-y-8">
        {history.map((item, historyIndex) => (
          <div
            key={historyIndex}
            ref={selectedQuery === item.query ? selectedRef : null}
            className={`border rounded-lg p-4 ${
              selectedQuery === item.query ? "ring-2 ring-blue-500" : ""
            }`}
          >
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
                onClick={() => handleDelete(item.timestamp)}
                className="text-gray-500 hover:text-red-600 transition-colors p-2"
                title="Delete query"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.responses.map((response, responseIndex) => (
                <div key={responseIndex} className="border rounded p-3">
                  <div className="mb-2">
                    <h4 className="font-semibold">{response.modelName}</h4>
                    <p className="text-xs text-gray-500">{response.provider}</p>
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
  );
}
