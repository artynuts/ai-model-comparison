import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { HistoryProvider } from "./context/HistoryContext";
import { StorageProvider } from "./context/StorageContext";
import Logo from "./components/Logo";

export const metadata: Metadata = {
  title: "AI Model Comparison",
  description: "Compare responses from different AI models",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <StorageProvider>
          <HistoryProvider>
            <div className="flex flex-col h-screen bg-gray-50">
              <header className="bg-white border-b border-gray-200 shadow-[0_1px_5px_0_rgba(0,0,0,0.05)] sticky top-0 z-10">
                <div className="max-w-screen-2xl px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Logo />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        AI Model Comparison
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Compare responses from different LLM models side by
                        side. Rate responses across different categories and
                        track model performance.
                      </p>
                    </div>
                  </div>
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
        </StorageProvider>
      </body>
    </html>
  );
}
