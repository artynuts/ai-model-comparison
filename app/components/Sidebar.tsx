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
  const { history } = useHistory();
  const pathname = usePathname();

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
              <Link
                key={index}
                href={`/history?query=${encodeURIComponent(item.query)}`}
                className="block p-2 text-sm hover:bg-gray-50 rounded"
              >
                <p className="truncate">{item.query}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
