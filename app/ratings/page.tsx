"use client";

import { useHistory } from "../context/HistoryContext";
import { RATING_CATEGORIES } from "../types";
import Link from "next/link";
import ThumbsIcon from "../components/ThumbsIcon";

function getRatingColor(value: boolean | null) {
  if (value === true) return "bg-green-100 text-green-700";
  if (value === false) return "bg-red-100 text-red-700";
  return "bg-gray-50 text-gray-500";
}

function getRatingSymbol(value: boolean | null) {
  if (value === true) {
    return <ThumbsIcon direction="up" selected={true} className="w-4 h-4" />;
  }
  if (value === false) {
    return <ThumbsIcon direction="down" selected={true} className="w-4 h-4" />;
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

      <div className="overflow-x-auto px-4">
        <div className="min-w-full py-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">By Model</h2>
          <table className="w-full border-collapse border border-gray-200 rounded-lg bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
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
                      i < modelNames.length - 1
                        ? "border-r border-gray-200"
                        : ""
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
                  className={`${
                    index === history.length - 1
                      ? ""
                      : "border-b border-gray-200"
                  } hover:bg-gray-50`}
                >
                  <td className="p-2 border-r border-gray-200 text-xs">
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
                        className={`p-2 text-center text-sm ${getRatingColor(
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
          <table className="w-full border-collapse border border-gray-200 rounded-lg bg-white mb-8 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
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
                  className={`${
                    index === history.length - 1
                      ? ""
                      : "border-b border-gray-200"
                  } hover:bg-gray-50`}
                >
                  <td className="p-2 border-r border-gray-200 text-xs">
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
                          className={`p-2 text-center text-sm ${getRatingColor(
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
    </div>
  );
}
