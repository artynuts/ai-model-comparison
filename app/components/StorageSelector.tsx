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
      <select
        value={storageType}
        onChange={(e) =>
          setStorageType(e.target.value as "postgres" | "localStorage")
        }
        className="w-full border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-lg px-3 py-1.5 text-sm bg-white transition-colors"
      >
        <option value="postgres">PostgreSQL Database</option>
        <option value="localStorage">Browser Local Storage</option>
      </select>
    </div>
  );
}
