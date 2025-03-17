"use client";

import { useState } from "react";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import { useStorage } from "../context/StorageContext";
import { HistoryItem } from "../lib/storage/StorageProvider";
import { v4 as uuidv4 } from "uuid";

interface ValidationResult {
  totalItems: number;
  itemsWithMissingIds: number;
  responsesWithMissingIds: number;
  itemsFixed: number;
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
      const localProvider = new LocalStorageProvider();
      const data = await localProvider.getHistory();

      if (data.length === 0) {
        setStatus("No data found in localStorage to validate.");
        return;
      }

      let itemsWithMissingIds = 0;
      let responsesWithMissingIds = 0;
      let itemsFixed = 0;

      // Validate and fix data
      const fixedData = data.map((item: HistoryItem) => {
        let itemWasFixed = false;

        // Check item ID
        if (!item.id || item.id.trim() === "") {
          itemsWithMissingIds++;
          item.id = uuidv4();
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
          responses: fixedResponses,
        };
      });

      // Save fixed data back to localStorage
      if (itemsFixed > 0) {
        localStorage.setItem("queryHistory", JSON.stringify(fixedData));
      }

      setResult({
        totalItems: data.length,
        itemsWithMissingIds,
        responsesWithMissingIds,
        itemsFixed,
      });

      setStatus(
        itemsFixed > 0
          ? `Fixed ${itemsFixed} items with issues.`
          : "No issues found in localStorage data."
      );
    } catch (error) {
      console.error("Validation failed:", error);
      setStatus("Validation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidationDisabled = storageType !== "localStorage" || isLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Data Validation</h3>
          <p className="text-sm text-gray-500">
            Check and fix data integrity issues in localStorage
          </p>
        </div>
        <button
          onClick={validateAndFixData}
          disabled={isValidationDisabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Validating..." : "Validate & Fix Data"}
        </button>
      </div>

      {status && (
        <div className="text-sm p-4 bg-gray-50 rounded-lg">
          <p>{status}</p>
          {result && (
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Total items checked: {result.totalItems}</li>
              <li>Items with missing IDs: {result.itemsWithMissingIds}</li>
              <li>
                Responses with missing IDs: {result.responsesWithMissingIds}
              </li>
              <li>Total items fixed: {result.itemsFixed}</li>
            </ul>
          )}
        </div>
      )}

      {storageType !== "localStorage" && (
        <p className="text-sm text-amber-600">
          Please switch to localStorage storage type to validate local data.
        </p>
      )}
    </div>
  );
}
