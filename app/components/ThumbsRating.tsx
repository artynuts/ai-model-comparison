"use client";

import { ResponseRating } from "../types";

interface ThumbsRatingProps {
  rating?: ResponseRating;
  onChange: (rating: ResponseRating) => void;
}

interface RatingCategoryProps {
  label: string;
  description: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

function RatingCategory({
  label,
  description,
  value,
  onChange,
}: RatingCategoryProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm text-gray-600" title={description}>
        {label}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`p-1.5 rounded-full transition-colors ${
            value === true
              ? "bg-green-100 text-green-600"
              : "hover:bg-gray-100 text-gray-400"
          }`}
          title="Thumbs up"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
        <button
          onClick={() => onChange(false)}
          className={`p-1.5 rounded-full transition-colors ${
            value === false
              ? "bg-red-100 text-red-600"
              : "hover:bg-gray-100 text-gray-400"
          }`}
          title="Thumbs down"
        >
          <svg
            className="w-5 h-5 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ThumbsRating({
  rating = { accuracy: null, relevance: null, completeness: null },
  onChange,
}: ThumbsRatingProps) {
  const handleCategoryChange = (
    category: keyof ResponseRating,
    value: boolean
  ) => {
    onChange({
      ...rating,
      [category]: value,
    });
  };

  return (
    <div className="space-y-3">
      <RatingCategory
        label="Accuracy"
        description="Were there any factual errors?"
        value={rating.accuracy}
        onChange={(value) => handleCategoryChange("accuracy", value)}
      />
      <RatingCategory
        label="Relevance"
        description="Did it fully answer the question?"
        value={rating.relevance}
        onChange={(value) => handleCategoryChange("relevance", value)}
      />
      <RatingCategory
        label="Complete"
        description="Was anything missing?"
        value={rating.completeness}
        onChange={(value) => handleCategoryChange("completeness", value)}
      />
    </div>
  );
}
