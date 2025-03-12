"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHistory } from "../context/HistoryContext";

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

  const handleDelete = (e: React.MouseEvent, timestamp: number) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm("Are you sure you want to delete this query?")) {
      deleteFromHistory(timestamp);
    }
  };

  return (
    <div className="w-64 h-screen border-r p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">AI Comparison</h1>
      </div>

      <nav className="flex-1">
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
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Recent Queries
          </h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((item, index) => (
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
                <button
                  onClick={(e) => handleDelete(e, item.timestamp)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-600"
                  title="Delete query"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
