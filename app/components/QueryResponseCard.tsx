"use client";

import { AIResponse } from "../types";
import MarkdownResponse from "./MarkdownResponse";
import ThumbsRating from "./ThumbsRating";

interface QueryResponseCardProps {
  response: AIResponse;
  onRatingChange?: (rating: AIResponse["rating"]) => void;
  variant?: "compact" | "full";
}

export default function QueryResponseCard({
  response,
  onRatingChange,
  variant = "full",
}: QueryResponseCardProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`bg-gray-50 border border-blue-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.1)] rounded-lg ${
        isCompact ? "p-0" : "p-0"
      }`}
    >
      <div className="mb-4 p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-bold ${isCompact ? "text-base" : "text-lg"}`}>
              {response.modelName}
            </h3>
            <p className="text-sm text-gray-500">{response.provider}</p>
            {!isCompact && (
              <>
                <p className="text-xs text-gray-400 font-mono">
                  {response.version}
                </p>
                <p className="text-xs text-gray-400">{response.description}</p>
              </>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Latency: {response.latency}ms
            </p>
          </div>
        </div>
      </div>
      {response.error ? (
        <p className="text-red-500">{response.error}</p>
      ) : (
        <>
          <div
            className={`${
              isCompact ? "text-sm" : ""
            } bg-blue-50 border-y border-blue-100`}
          >
            <div className="p-3">
              <MarkdownResponse content={response.response} />
            </div>
          </div>
          {onRatingChange && (
            <div className="mt-4 pt-4 border-t border-blue-50 p-3">
              <ThumbsRating
                rating={response.rating}
                onChange={onRatingChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
