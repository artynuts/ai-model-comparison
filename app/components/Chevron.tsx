"use client";

interface ChevronProps {
  direction?: "down" | "up";
  className?: string;
}

export default function Chevron({
  direction = "down",
  className = "",
}: ChevronProps) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 transition-transform ${className} ${
        direction === "up" ? "rotate-180" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
