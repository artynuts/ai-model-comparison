"use client";

import { useState } from "react";
import Chevron from "./Chevron";

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
        <div
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <Chevron />
        </div>
        <span className="ml-1">
          {isExpanded ? "Hide Details" : "Show Details"}
        </span>
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
