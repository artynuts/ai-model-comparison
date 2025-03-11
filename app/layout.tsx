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
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen p-8">{children}</main>
          </div>
        </HistoryProvider>
      </body>
    </html>
  );
}
