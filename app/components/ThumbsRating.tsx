"use client";

import { ResponseRating, RATING_CATEGORIES } from "../types";
import ThumbsIcon from "./ThumbsIcon";

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
              ? "text-green-100 hover:text-green-600"
              : "text-gray-300 hover:text-gray-600"
          }`}
          title="Thumbs up"
        >
          <ThumbsIcon direction="up" selected={value === true} />
        </button>
        <button
          onClick={() => onChange(false)}
          className={`transition-colors ${
            value === false
              ? "text-red-100 hover:text-red-600"
              : "text-gray-300 hover:text-gray-600"
          }`}
          title="Thumbs down"
        >
          <ThumbsIcon direction="down" selected={value === false} />
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
