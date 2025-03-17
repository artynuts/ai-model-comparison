"use client";

import { useState } from "react";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../lib/storage/PostgresStorageProvider";
import { useStorage } from "../context/StorageContext";

export default function DataMigration() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { storageType } = useStorage();

  const handleMigration = async () => {
    setIsLoading(true);
    setStatus("Starting migration...");

    try {
      // Get data from localStorage
      const localProvider = new LocalStorageProvider();
      const localData = await localProvider.getHistory();

      if (localData.length === 0) {
        setStatus("No data found in localStorage to migrate.");
        setIsLoading(false);
        return;
      }

      setStatus(
        `Found ${localData.length} items in localStorage. Migrating...`
      );

      // Migrate to PostgreSQL
      const pgProvider = new PostgresStorageProvider();

      // Migrate each item
      for (let i = 0; i < localData.length; i++) {
        const item = localData[i];
        await pgProvider.addHistory(
          item.query,
          item.responses,
          item.id,
          item.timestamp
        );
        setStatus(`Migrated ${i + 1} of ${localData.length} items...`);
      }

      setStatus(
        `Successfully migrated ${localData.length} items to PostgreSQL.`
      );
    } catch (error) {
      console.error("Migration failed:", error);
      setStatus("Migration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMigrationDisabled = storageType !== "postgres" || isLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Migration</h3>
          <p className="text-sm text-gray-500">
            Transfer your data from localStorage to PostgreSQL database
          </p>
        </div>
        <button
          onClick={handleMigration}
          disabled={isMigrationDisabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Migrating..." : "Migrate to PostgreSQL"}
        </button>
      </div>
      {status && (
        <div className="text-sm p-4 bg-gray-50 rounded-lg">
          <p>{status}</p>
        </div>
      )}
      {storageType !== "postgres" && (
        <p className="text-sm text-amber-600">
          Please switch to PostgreSQL storage type before migrating data.
        </p>
      )}
    </div>
  );
}
