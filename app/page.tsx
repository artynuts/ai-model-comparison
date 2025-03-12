"use client";
import Image from "next/image";
import { useState } from "react";
import ComparisonForm from "./components/ComparisonForm";

export default function Home() {
  return (
    <div className="p-8 flex justify-center">
      <ComparisonForm />
    </div>
  );
}
