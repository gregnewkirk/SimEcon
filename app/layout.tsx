import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimEcon - US Federal Budget Sandbox",
  description:
    "Pull the levers on taxes and programs and watch the impact on the US deficit, debt, and who pays. Every number is sourced to CBO, JCT, OMB, and Treasury.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen bg-[#F2F2F7] text-[#1C1C1E]`}
      >
        {children}
      </body>
    </html>
  );
}
