"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStorage } from "../context/StorageContext";
import StorageSelector from "./StorageSelector";
import DeleteButton from "./DeleteButton";
import Chevron from "./Chevron";

interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
}

interface SidebarProps {
  history: QueryHistory[];
}

const LINKS = [
  { href: "/", label: "Compare" },
  { href: "/history", label: "History" },
  { href: "/ratings", label: "Ratings" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { history, deleteFromHistory } = useStorage();
  const [isRecentQueriesOpen, setIsRecentQueriesOpen] = useState(true);

  // Get the 5 most recent queries
  const recentQueries = history
    .slice(0, 5)
    .map(({ query, timestamp, id }) => ({ query, timestamp, id }));

  return (
    <div className="sticky top-0 h-screen overflow-y-auto border-standard p-4 flex flex-col">
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-1">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block px-4 py-2 border-standard rounded-lg transition-colors ${
                  pathname === href
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <StorageSelector variant="sidebar" />

        <div className="mt-6 p-1">
          <button
            onClick={() => setIsRecentQueriesOpen(!isRecentQueriesOpen)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-500 mb-2 px-4 py-2 border-standard rounded-lg transition-colors hover:bg-gray-50"
          >
            <span>Recent Queries</span>
            <Chevron direction={isRecentQueriesOpen ? "up" : "down"} />
          </button>
          <div
            className={`space-y-2 overflow-hidden transition-all duration-200 ${
              isRecentQueriesOpen ? "max-h-[calc(100vh-350px)]" : "max-h-0"
            }`}
          >
            {recentQueries.map(({ query, timestamp, id }) => (
              <div
                key={id}
                className="group relative block text-sm rounded p-1"
              >
                <Link
                  href={`/history?query=${encodeURIComponent(query)}`}
                  className="block p-2 border-standard rounded-lg transition-colors hover:bg-gray-50"
                >
                  <p className="truncate pr-6">{query}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(timestamp).toLocaleString()}
                  </p>
                </Link>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <DeleteButton
                    onDelete={() => deleteFromHistory(id)}
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
