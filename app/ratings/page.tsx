"use client";

import { useHistory } from "../context/HistoryContext";
import { RATING_CATEGORIES } from "../types";
import Link from "next/link";

function getRatingColor(value: boolean | null) {
  if (value === true) return "bg-green-100 text-green-700";
  if (value === false) return "bg-red-100 text-red-700";
  return "bg-gray-50 text-gray-500";
}

function getRatingSymbol(value: boolean | null) {
  if (value === true) return "👍";
  if (value === false) return "👎";
  return "-";
}

export default function RatingsPage() {
  const { history } = useHistory();

  // Get unique model names from all responses
  const modelNames = Array.from(
    new Set(
      history.flatMap((item) =>
        item.responses.map((response) => response.modelName)
      )
    )
  ).sort();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ratings Summary</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Back to Compare
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="text-left p-3 bg-gray-50 border-b font-medium text-gray-700"
              >
                Query
              </th>
              {modelNames.map((modelName) => (
                <th
                  key={modelName}
                  colSpan={RATING_CATEGORIES.length}
                  className="p-3 bg-gray-50 border-b font-medium text-gray-700 text-center"
                >
                  <div className="whitespace-nowrap">{modelName}</div>
                </th>
              ))}
            </tr>
            <tr>
              {modelNames.map((modelName) =>
                RATING_CATEGORIES.map((category) => (
                  <th
                    key={`${modelName}-${category.key}`}
                    className="p-2 bg-gray-50 border-b font-medium text-gray-700 text-center"
                    title={category.description}
                  >
                    <div className="text-xs text-gray-500">
                      {category.label}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Link
                    href={`/history?query=${encodeURIComponent(item.query)}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {item.query}
                  </Link>
                </td>
                {modelNames.map((modelName) => {
                  const response = item.responses.find(
                    (r) => r.modelName === modelName
                  );
                  return RATING_CATEGORIES.map((category) => (
                    <td
                      key={`${modelName}-${category.key}`}
                      className={`p-3 text-center ${getRatingColor(
                        response?.rating?.[category.key] ?? null
                      )}`}
                    >
                      {getRatingSymbol(
                        response?.rating?.[category.key] ?? null
                      )}
                    </td>
                  ));
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
