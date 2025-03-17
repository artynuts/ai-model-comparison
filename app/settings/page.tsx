"use client";

import { useStorage } from "../context/StorageContext";
import Link from "next/link";
import StorageSelector from "../components/StorageSelector";
import DataMigration from "../components/DataMigration";
import DataValidation from "../components/DataValidation";
import DataDeletion from "../components/DataDeletion";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Back to Compare
        </Link>
      </div>

      <div className="space-y-8">
        {/* Storage Section */}
        <section className="bg-white border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Storage</h2>
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-600">
              Choose where to store your query history and ratings. You can
              switch between PostgreSQL database for persistent storage or
              browser local storage for offline usage.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="w-full max-w-xs">
                <StorageSelector variant="settings" />
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <h3 className="font-medium text-gray-700 mb-2">
                Storage Details:
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>PostgreSQL Database:</strong> Data persists across
                  devices and browsers. Requires database connection.
                </li>
                <li>
                  <strong>Browser Local Storage:</strong> Data stored in your
                  browser. Works offline but limited to this device.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Tools Section */}
        <section className="bg-white border border-gray-200 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Data Tools
          </h2>
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-600">
              Tools for managing and maintaining your data across storage
              systems.
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <DataMigration />
            </div>
            <div className="border-b border-gray-200 pb-6">
              <DataValidation />
            </div>
            <div>
              <DataDeletion />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
