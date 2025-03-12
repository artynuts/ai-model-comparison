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
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg bg-white">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="text-left p-3 border-b border-r border-gray-200 font-medium text-gray-700"
              >
                Query
              </th>
              {modelNames.map((modelName, i) => (
                <th
                  key={modelName}
                  colSpan={RATING_CATEGORIES.length}
                  className={`p-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-center ${
                    i < modelNames.length - 1 ? "border-r border-gray-200" : ""
                  }`}
                >
                  <div className="whitespace-nowrap">{modelName}</div>
                </th>
              ))}
            </tr>
            <tr>
              {modelNames.map((modelName, i) =>
                RATING_CATEGORIES.map((category, j) => (
                  <th
                    key={`${modelName}-${category.key}`}
                    className={`p-2 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-center ${
                      i < modelNames.length - 1 &&
                      j === RATING_CATEGORIES.length - 1
                        ? "border-r border-gray-200"
                        : ""
                    }`}
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
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3 border-r border-gray-200">
                  <Link
                    href={`/history?query=${encodeURIComponent(item.query)}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {item.query}
                  </Link>
                </td>
                {modelNames.map((modelName, i) => {
                  const response = item.responses.find(
                    (r) => r.modelName === modelName
                  );
                  return RATING_CATEGORIES.map((category, j) => (
                    <td
                      key={`${modelName}-${category.key}`}
                      className={`p-3 text-center ${getRatingColor(
                        response?.rating?.[category.key] ?? null
                      )} ${
                        i < modelNames.length - 1 &&
                        j === RATING_CATEGORIES.length - 1
                          ? "border-r border-gray-200"
                          : ""
                      }`}
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
