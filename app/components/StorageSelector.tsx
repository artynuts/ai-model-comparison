"use client";

import { useStorage } from "../context/StorageContext";

export default function StorageSelector() {
  const { storageType, setStorageType } = useStorage();

  return (
    <div className="mt-4 mb-4 p-1">
      <label className="block text-sm text-gray-600 mb-1.5">Storage:</label>
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
