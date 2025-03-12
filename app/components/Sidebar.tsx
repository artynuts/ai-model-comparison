"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHistory } from "../context/HistoryContext";
import DeleteButton from "./DeleteButton";

interface QueryHistory {
  query: string;
  timestamp: number;
}

interface SidebarProps {
  history: QueryHistory[];
}

export default function Sidebar() {
  const { history, deleteFromHistory } = useHistory();
  const pathname = usePathname();
  const [isRecentQueriesOpen, setIsRecentQueriesOpen] = useState(true);

  return (
    <div className="sticky top-0 h-screen overflow-y-auto border-r border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] p-4 flex flex-col">
      <nav className="flex-1 overflow-y-auto">
        <Link
          href="/"
          className={`block mb-2 p-2 rounded ${
            pathname === "/" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
          }`}
        >
          Compare Models
        </Link>
        <Link
          href="/history"
          className={`block mb-2 p-2 rounded ${
            pathname === "/history"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-50"
          }`}
        >
          Full History
        </Link>

        <div className="mt-6">
          <button
            onClick={() => setIsRecentQueriesOpen(!isRecentQueriesOpen)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-500 mb-2 hover:text-gray-700"
          >
            <span>Recent Queries</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isRecentQueriesOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`space-y-2 overflow-hidden transition-all duration-200 ${
              isRecentQueriesOpen ? "max-h-96" : "max-h-0"
            }`}
          >
            {history.map((item, index) => (
              <div
                key={index}
                className="group relative block p-2 text-sm hover:bg-gray-50 rounded"
              >
                <Link
                  href={`/history?query=${encodeURIComponent(item.query)}`}
                  className="block"
                >
                  <p className="truncate pr-6">{item.query}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </Link>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <DeleteButton
                    onDelete={() => deleteFromHistory(item.timestamp)}
                    size="sm"
                    showOnHover
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
