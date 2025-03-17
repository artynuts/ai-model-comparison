"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

export default function CollapsibleSection({
  children,
  isOpen = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        <svg
          className={`w-4 h-4 mr-1 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {isExpanded ? "Hide Details" : "Show Details"}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
