"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import QueryGroup from "../components/QueryGroup";
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
          >
            <QueryGroup
              query={item.query}
              timestamp={item.timestamp}
              responses={item.responses}
              onDelete={() => deleteFromHistory(item.timestamp)}
              onRatingChange={(responseIndex, rating) =>
                rating &&
                updateResponseRating(item.timestamp, responseIndex, rating)
              }
              isSelected={selectedQuery === item.query}
              variant="compact"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
