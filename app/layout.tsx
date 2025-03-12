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
          <div className="flex min-h-screen">
            <div className="w-64 flex-shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </HistoryProvider>
      </body>
    </html>
  );
}
