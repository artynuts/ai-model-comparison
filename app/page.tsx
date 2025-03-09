"use client";
import Image from "next/image";
import { useState } from "react";
import ComparisonForm from "./components/ComparisonForm";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold mb-4">AI Model Comparison</h1>
        <ComparisonForm />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Response cards will go here */}
        </div>
      </main>
    </div>
  );
}
