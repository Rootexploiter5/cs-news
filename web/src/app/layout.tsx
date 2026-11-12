import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sentinel AI — Autonomous Threat Intelligence Platform",
  description: "Real-time cybersecurity news ingestion, structured LLM extraction, and pgvector RAG analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-slate-950 text-slate-100 h-full overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}

