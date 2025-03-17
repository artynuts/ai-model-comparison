"use client";

import { useState } from "react";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { PostgresStorageProvider } from "../lib/storage/PostgresStorageProvider";
import { useStorage } from "../context/StorageContext";
import { HistoryItem } from "../lib/storage/StorageProvider";
import { v4 as uuidv4 } from "uuid";
import CollapsibleSection from "./CollapsibleSection";

interface ValidationResult {
  totalItems: number;
  itemsWithMissingIds: number;
  responsesWithMissingIds: number;
  itemsFixed: number;
  orderFixed: boolean;
  queriesTrimmed: number;
}

export default function DataValidation() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { storageType } = useStorage();

  const validateAndFixData = async () => {
    setIsLoading(true);
    setStatus("Starting validation...");
    setResult(null);

    try {
      const provider =
        storageType === "postgres"
          ? new PostgresStorageProvider()
          : new LocalStorageProvider();
      const data = await provider.getHistory();

      if (data.length === 0) {
        setStatus(`No data found in ${storageType} to validate.`);
        return;
      }

      let itemsWithMissingIds = 0;
      let responsesWithMissingIds = 0;
      let itemsFixed = 0;
      let orderFixed = false;
      let queriesTrimmed = 0;

      // Validate and fix data
      let fixedData = data.map((item: HistoryItem) => {
        let itemWasFixed = false;

        // Check item ID
        if (!item.id || item.id.trim() === "") {
          itemsWithMissingIds++;
          item.id = uuidv4();
          itemWasFixed = true;
        }

        // Trim query
        const trimmedQuery = item.query.trim();
        if (trimmedQuery !== item.query) {
          queriesTrimmed++;
          itemWasFixed = true;
        }

        // Check response IDs
        const fixedResponses = item.responses.map((response) => {
          if (!response.id || response.id.trim() === "") {
            responsesWithMissingIds++;
            itemWasFixed = true;
            return { ...response, id: uuidv4() };
          }
          return response;
        });

        if (itemWasFixed) {
          itemsFixed++;
        }

        return {
          ...item,
          query: trimmedQuery,
          responses: fixedResponses,
        };
      });

      // Check if items are in correct order (most recent first)
      const isCorrectOrder = fixedData.every((item, index) => {
        if (index === 0) return true;
        return item.timestamp <= fixedData[index - 1].timestamp;
      });

      if (!isCorrectOrder) {
        fixedData.sort((a, b) => b.timestamp - a.timestamp);
        orderFixed = true;
        itemsFixed++;
      }

      // Save fixed data back to storage if any changes were made
      if (itemsFixed > 0 || orderFixed) {
        if (storageType === "localStorage") {
          localStorage.setItem("queryHistory", JSON.stringify(fixedData));
        } else {
          // For PostgreSQL, update each modified item
          for (const item of fixedData) {
            const original = data.find((d) => d.id === item.id);
            if (
              original &&
              (original.query !== item.query ||
                JSON.stringify(original.responses) !==
                  JSON.stringify(item.responses))
            ) {
              await provider.addHistory(
                item.query,
                item.responses,
                item.id,
                item.timestamp
              );
            }
          }
        }
      }

      setResult({
        totalItems: data.length,
        itemsWithMissingIds,
        responsesWithMissingIds,
        itemsFixed,
        orderFixed,
        queriesTrimmed,
      });

      const statusMessages = [];
      if (itemsFixed > 0) {
        statusMessages.push(`Fixed ${itemsFixed} items with issues`);
      }
      if (queriesTrimmed > 0) {
        statusMessages.push(`Trimmed ${queriesTrimmed} queries`);
      }
      if (orderFixed) {
        statusMessages.push("Fixed timestamp ordering");
      }

      setStatus(
        statusMessages.length > 0
          ? `${statusMessages.join(". ")}.`
          : `No issues found in ${storageType} data.`
      );
    } catch (error) {
      console.error("Validation failed:", error);
      setStatus("Validation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Validation</h3>
          <p className="text-sm text-gray-500">
            Check and fix data integrity issues in{" "}
            {storageType === "postgres" ? "PostgreSQL" : "localStorage"}
          </p>
        </div>
        <button
          onClick={validateAndFixData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Validating..." : "Validate & Fix Data"}
        </button>
      </div>

      {status && (
        <div className="text-sm p-4 bg-gray-50 rounded-lg">
          <p>{status}</p>
          {result && (
            <CollapsibleSection isOpen={false}>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>Total items checked: {result.totalItems}</li>
                <li>Items with missing IDs: {result.itemsWithMissingIds}</li>
                <li>
                  Responses with missing IDs: {result.responsesWithMissingIds}
                </li>
                <li>Queries trimmed: {result.queriesTrimmed}</li>
                <li>
                  Items with fixed IDs:{" "}
                  {result.itemsFixed - (result.orderFixed ? 1 : 0)}
                </li>
                {result.orderFixed && (
                  <li className="text-amber-600">
                    ⚠️ Fixed incorrect timestamp ordering
                  </li>
                )}
              </ul>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}
