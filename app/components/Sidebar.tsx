"use client";

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

  return (
    <div className="sticky top-0 h-screen overflow-y-auto border-r border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">AI Comparison</h1>
      </div>

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
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Recent Queries
          </h2>
          <div className="space-y-2">
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
