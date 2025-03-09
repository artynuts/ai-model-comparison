"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  content: string;
}

export default function MarkdownResponse({ content }: MarkdownResponseProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
