"use client";

import { ResponseRating, RATING_CATEGORIES } from "../types";

interface ThumbsRatingProps {
  rating?: ResponseRating;
  onChange: (rating: ResponseRating) => void;
  showAverage?: boolean;
  showLabel?: boolean;
}

interface RatingCategoryProps {
  label: string;
  description: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

type RatingResult = {
  text: string;
  percentage: number;
  isRated: boolean;
};

function calculateAverageRating(rating?: ResponseRating): RatingResult {
  if (!rating) return { text: "Not rated", percentage: 0, isRated: false };

  const values = RATING_CATEGORIES.map((category) => rating[category.key]);
  const validValues = values.filter(
    (value): value is boolean => value !== null
  );

  if (validValues.length === 0)
    return { text: "Not rated", percentage: 0, isRated: false };

  const positiveCount = validValues.filter(Boolean).length;
  const percentage = (positiveCount / validValues.length) * 100;
  return {
    text: `${Math.round(percentage)}% positive`,
    percentage: Math.round(percentage),
    isRated: true,
  };
}

function getAverageRatingStyles(result: RatingResult): string {
  if (!result.isRated) return "bg-gray-100 text-gray-600"; // Not rated
  if (result.percentage > 75) return "bg-green-100 text-green-700";
  if (result.percentage < 50) return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700"; // Between 50 and 75
}

function RatingCategory({
  label,
  description,
  value,
  onChange,
}: RatingCategoryProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-24 text-sm text-gray-600" title={description}>
        {label}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`transition-colors ${
            value === true
              ? "text-green-600"
              : "text-gray-400 hover:text-gray-600"
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
              strokeWidth={1.5}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
        <button
          onClick={() => onChange(false)}
          className={`transition-colors ${
            value === false
              ? "text-red-600"
              : "text-gray-400 hover:text-gray-600"
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
              strokeWidth={1.5}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ThumbsRating({
  rating = Object.fromEntries(
    RATING_CATEGORIES.map((cat) => [cat.key, null])
  ) as ResponseRating,
  onChange,
  showAverage = true,
  showLabel = true,
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

  const averageRating = calculateAverageRating(rating);
  const ratingStyles = getAverageRatingStyles(averageRating);

  return (
    <div>
      {(showLabel || showAverage) && (
        <div className="flex justify-between items-center mb-3">
          {showLabel && (
            <p className="text-sm font-medium text-gray-700">
              Rate this response:
            </p>
          )}
          {showAverage && (
            <div
              className={`px-3 py-1 rounded-full font-medium ${ratingStyles}`}
              title={
                averageRating.isRated
                  ? `${averageRating.percentage}% of rated categories are positive`
                  : "No ratings yet"
              }
            >
              {averageRating.isRated ? averageRating.text : "Not rated"}
            </div>
          )}
        </div>
      )}
      <div className="space-y-1">
        {RATING_CATEGORIES.map((category) => (
          <RatingCategory
            key={category.key}
            label={category.label}
            description={category.description}
            value={rating[category.key]}
            onChange={(value) => handleCategoryChange(category.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
