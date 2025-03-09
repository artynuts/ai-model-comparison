"use client";

import { useState } from "react";

export default function ComparisonForm() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement API calls to AI models
      console.log("Query submitted:", query);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded-lg h-32"
          placeholder="Enter your query here..."
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? "Comparing..." : "Compare Models"}
      </button>
    </form>
  );
}
