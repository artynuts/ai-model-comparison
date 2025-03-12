import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { HistoryProvider } from "./context/HistoryContext";

export const metadata: Metadata = {
  title: "AI Model Comparison",
  description: "Compare responses from different AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <HistoryProvider>
          <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 shadow-[0_1px_5px_0_rgba(0,0,0,0.05)] sticky top-0 z-10">
              <div className="max-w-screen-2xl mx-auto px-8 py-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Model Comparison
                </h1>
              </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-64 flex-shrink-0 bg-white">
                <Sidebar />
              </div>
              <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
          </div>
        </HistoryProvider>
      </body>
    </html>
  );
}
