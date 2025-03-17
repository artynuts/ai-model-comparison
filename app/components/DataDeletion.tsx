"use client";

import { useState } from "react";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../lib/storage/PostgresStorageProvider";
import { useStorage } from "../context/StorageContext";
import CollapsibleSection from "./CollapsibleSection";

export default function DataDeletion() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { storageType } = useStorage();

  const deleteAllData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all data? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setStatus("Starting data deletion...");

    try {
      const provider =
        storageType === "postgres"
          ? new PostgresStorageProvider()
          : new LocalStorageProvider();

      if (storageType === "postgres") {
        // For PostgreSQL, we need to delete all records
        const response = await fetch("/api/history/all", {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete data from PostgreSQL");
        }
      } else {
        // For localStorage, we can clear the entire storage
        localStorage.removeItem("queryHistory");
      }

      setStatus(`Successfully deleted all data from ${storageType}`);
    } catch (error) {
      console.error("Data deletion failed:", error);
      setStatus("Failed to delete data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Deletion</h3>
          <p className="text-sm text-gray-500">
            Permanently delete all data from{" "}
            {storageType === "postgres" ? "PostgreSQL" : "localStorage"}
          </p>
        </div>
        <button
          onClick={deleteAllData}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors"
        >
          {isLoading
            ? "Deleting..."
            : `Delete All ${
                storageType === "postgres" ? "PostgreSQL" : "Local Storage"
              } Data`}
        </button>
      </div>
      {status && (
        <div className="text-sm p-4 bg-gray-50 rounded-lg">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
