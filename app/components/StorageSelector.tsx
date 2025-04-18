"use client";

import { useStorage } from "../context/StorageContext";
import Chevron from "./Chevron";

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
          className="w-full border-standard rounded-lg px-4 py-1.5 text-sm bg-white transition-colors appearance-none"
        >
          <option value="postgres">PostgreSQL Database</option>
          <option value="localStorage">Browser Local Storage</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Chevron />
        </div>
      </div>
    </div>
  );
}
