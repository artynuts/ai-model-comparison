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
  if (value === true) {
    return (
      <svg
        className="w-4 h-4 inline-block text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
    );
  }
  if (value === false) {
    return (
      <svg
        className="w-4 h-4 inline-block text-red-600 rotate-180"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
    );
  }
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">By Model</h2>
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg bg-white mb-8">
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
                  className={`p-3 border-b border-gray-200 font-medium text-gray-700 text-center ${
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
                    className={`p-2 border-b border-gray-200 font-medium text-gray-700 text-center ${
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

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          By Category
        </h2>
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg bg-white">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="text-left p-3 border-b border-r border-gray-200 font-medium text-gray-700"
              >
                Query
              </th>
              {RATING_CATEGORIES.map((category) => (
                <th
                  key={category.key}
                  colSpan={modelNames.length}
                  className="p-3 border-b border-gray-200 font-medium text-gray-700 text-center border-r border-gray-200"
                  title={category.description}
                >
                  <div className="whitespace-nowrap">{category.label}</div>
                </th>
              ))}
            </tr>
            <tr>
              {RATING_CATEGORIES.map((category) =>
                modelNames.map((modelName, i) => (
                  <th
                    key={`${category.key}-${modelName}`}
                    className={`p-2 border-b border-gray-200 font-medium text-gray-700 text-center ${
                      i === modelNames.length - 1
                        ? "border-r border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="text-xs text-gray-500">{modelName}</div>
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
                {RATING_CATEGORIES.map((category) =>
                  modelNames.map((modelName, i) => {
                    const response = item.responses.find(
                      (r) => r.modelName === modelName
                    );
                    return (
                      <td
                        key={`${category.key}-${modelName}`}
                        className={`p-3 text-center ${getRatingColor(
                          response?.rating?.[category.key] ?? null
                        )} ${
                          i === modelNames.length - 1
                            ? "border-r border-gray-200"
                            : ""
                        }`}
                      >
                        {getRatingSymbol(
                          response?.rating?.[category.key] ?? null
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
