"use client";

import { useStorage } from "../context/StorageContext";

export default function StorageSelector() {
  const { storageType, setStorageType } = useStorage();

  return (
    <div className="flex items-center space-x-4 mb-4">
      <label className="text-sm font-medium">Storage Type:</label>
      <select
        value={storageType}
        onChange={(e) =>
          setStorageType(e.target.value as "postgres" | "localStorage")
        }
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="postgres">PostgreSQL Database</option>
        <option value="localStorage">Browser Local Storage</option>
      </select>
    </div>
  );
}
