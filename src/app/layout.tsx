import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "ClauseGuard — Smart Contract & TOS Analyzer",
  description:
    "Upload a contract or Terms of Service and instantly get a Risk Score with hidden gotchas highlighted in plain English.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased">
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
