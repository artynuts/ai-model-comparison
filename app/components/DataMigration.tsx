"use client";

import { useState } from "react";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../lib/storage/PostgresStorageProvider";
import { useStorage } from "../context/StorageContext";
import CollapsibleSection from "./CollapsibleSection";

export default function DataMigration() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { storageType } = useStorage();
  const [skippedQueries, setSkippedQueries] = useState<string[]>([]);

  const migrateToPostgres = async () => {
    setIsLoading(true);
    setStatus("Starting migration to PostgreSQL...");
    setSkippedQueries([]);

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
      let migrated = 0;
      let skipped = 0;
      const skippedList: string[] = [];

      // Migrate each item
      for (let i = 0; i < localData.length; i++) {
        const item = localData[i];
        const result = await pgProvider.addHistory(
          item.query,
          item.responses,
          item.id,
          item.timestamp
        );

        if (result.skipped) {
          skipped++;
          skippedList.push(item.query);
        } else {
          migrated++;
        }

        setStatus(
          `Progress: ${i + 1}/${
            localData.length
          } (${migrated} new, ${skipped} existing)`
        );
      }

      setSkippedQueries(skippedList);
      setStatus(
        `Migration complete: ${migrated} items migrated, ${skipped} items skipped.`
      );
    } catch (error) {
      console.error("Migration failed:", error);
      setStatus("Migration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const migrateToLocalStorage = async () => {
    setIsLoading(true);
    setStatus("Starting migration to localStorage...");
    setSkippedQueries([]);

    try {
      // Get data from PostgreSQL
      const pgProvider = new PostgresStorageProvider();
      const pgData = await pgProvider.getHistory();

      if (pgData.length === 0) {
        setStatus("No data found in PostgreSQL to migrate.");
        setIsLoading(false);
        return;
      }

      setStatus(`Found ${pgData.length} items in PostgreSQL. Migrating...`);

      // Migrate to localStorage
      const localProvider = new LocalStorageProvider();
      let migrated = 0;
      let skipped = 0;
      const skippedList: string[] = [];

      // Migrate each item
      for (let i = 0; i < pgData.length; i++) {
        const item = pgData[i];
        const result = await localProvider.addHistory(
          item.query,
          item.responses,
          item.id,
          item.timestamp
        );

        if (result.skipped) {
          skipped++;
          skippedList.push(item.query);
        } else {
          migrated++;
        }

        setStatus(
          `Progress: ${i + 1}/${
            pgData.length
          } (${migrated} new, ${skipped} existing)`
        );
      }

      setSkippedQueries(skippedList);
      setStatus(
        `Migration complete: ${migrated} items migrated, ${skipped} items skipped.`
      );
    } catch (error) {
      console.error("Migration failed:", error);
      setStatus("Migration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = () => {
    if (storageType === "postgres") {
      migrateToLocalStorage();
    } else {
      migrateToPostgres();
    }
  };

  const getMigrationButtonText = () => {
    if (isLoading) return "Migrating...";
    return storageType === "postgres"
      ? "Migrate to localStorage"
      : "Migrate to PostgreSQL";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Migration</h3>
          <p className="text-sm text-gray-500">
            Transfer your data between localStorage and PostgreSQL database
          </p>
        </div>
        <button
          onClick={handleMigration}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {getMigrationButtonText()}
        </button>
      </div>
      {status && (
        <div className="text-sm p-4 bg-gray-50 rounded-lg">
          <p>{status}</p>
          {skippedQueries.length > 0 && (
            <CollapsibleSection isOpen={false}>
              <div className="mt-2 text-gray-600">
                <p className="font-medium mb-1">Skipped queries:</p>
                <ul className="space-y-1 list-disc pl-4">
                  {skippedQueries.map((query, index) => (
                    <li key={index}>"{query}"</li>
                  ))}
                </ul>
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}
