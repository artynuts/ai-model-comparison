"use client";

import { useStorage } from "../context/StorageContext";

export default function StorageSelector() {
  const { storageType, setStorageType } = useStorage();

  return (
    <div className="flex items-center space-x-2 mb-4">
      <label className="text-sm text-gray-600">Storage:</label>
      <select
        value={storageType}
        onChange={(e) =>
          setStorageType(e.target.value as "postgres" | "localStorage")
        }
        className="flex-1 border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-sm px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="postgres">PostgreSQL Database</option>
        <option value="localStorage">Browser Local Storage</option>
      </select>
    </div>
  );
}
