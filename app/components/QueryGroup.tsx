"use client";

import { AIResponse } from "../types";
import QueryResponseCard from "./QueryResponseCard";
import DeleteButton from "./DeleteButton";

interface QueryGroupProps {
  query: string;
  timestamp: number;
  id?: string;
  responses: AIResponse[];
  onDelete?: () => void;
  onRatingChange?: (
    responseIndex: number,
    rating: AIResponse["rating"]
  ) => void;
  isSelected?: boolean;
  variant?: "compact" | "full";
}

export default function QueryGroup({
  query,
  timestamp,
  id,
  responses,
  onDelete,
  onRatingChange,
  isSelected,
  variant = "full",
}: QueryGroupProps) {
  return (
    <div
      className={`bg-white border-standard rounded-lg p-4 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-mono bg-gray-100 p-2 rounded">{query}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(timestamp).toLocaleString()}
          </p>
        </div>
        {onDelete && (
          <DeleteButton onDelete={onDelete} className="text-gray-500" />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {responses.map((response, index) => (
          <QueryResponseCard
            key={response.id}
            response={response}
            variant={variant}
            onRatingChange={
              onRatingChange
                ? (rating) => onRatingChange(index, rating)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
