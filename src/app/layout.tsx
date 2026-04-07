import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StepWise — AI-Guided Active Learning",
  description:
    "An AI-powered learning platform that guides students through concepts step by step with interactive activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-screen flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
