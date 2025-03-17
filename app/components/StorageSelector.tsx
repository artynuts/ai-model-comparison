"use client";

import { useStorage } from "../context/StorageContext";

interface StorageSelectorProps {
  variant?: "sidebar" | "settings";
}

export default function StorageSelector({
  variant = "sidebar",
}: StorageSelectorProps) {
  const { storageType, setStorageType } = useStorage();

  const containerClasses = variant === "sidebar" ? "mt-4 mb-4 px-2" : "";

  return (
    <div className={containerClasses}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Storage Type:
      </label>
      <div className="relative">
        <select
          value={storageType}
          onChange={(e) =>
            setStorageType(e.target.value as "postgres" | "localStorage")
          }
          className="w-full border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-lg px-4 py-1.5 text-sm bg-white transition-colors appearance-none"
        >
          <option value="postgres">PostgreSQL Database</option>
          <option value="localStorage">Browser Local Storage</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
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
        </div>
      </div>
    </div>
  );
}
