"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import QueryGroup from "../components/QueryGroup";
import StorageSelector from "../components/StorageSelector";
import { useStorage } from "../context/StorageContext";

export default function History() {
  const searchParams = useSearchParams();
  const selectedQuery = searchParams.get("query");
  const selectedRef = useRef<HTMLDivElement>(null);
  const { history, deleteFromHistory, updateResponseRating } = useStorage();

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
      <h1 className="text-2xl font-bold mb-4">Query History</h1>
      <StorageSelector />

      <div className="space-y-8">
        {history.map((item) => (
          <div
            key={item.id}
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
