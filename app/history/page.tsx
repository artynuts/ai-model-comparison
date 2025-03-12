"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import QueryResponseCard from "../components/QueryResponseCard";
import DeleteButton from "../components/DeleteButton";
import { useHistory } from "../context/HistoryContext";

export default function History() {
  const searchParams = useSearchParams();
  const selectedQuery = searchParams.get("query");
  const { history, deleteFromHistory, updateResponseRating } = useHistory();
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedQuery && selectedRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedQuery]);

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
              <DeleteButton
                onDelete={() => deleteFromHistory(item.timestamp)}
                className="text-gray-500"
              />
            </div>
            <div className="space-y-4">
              {item.responses.map((response, responseIndex) => (
                <QueryResponseCard
                  key={responseIndex}
                  response={response}
                  variant="compact"
                  onRatingChange={(rating) =>
                    rating &&
                    updateResponseRating(item.timestamp, responseIndex, rating)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
