import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimEcon — US Economic Policy Simulator",
  description:
    "Adjust tax rates and social programs, then watch the impact on US debt, deficit, and wealth distribution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-[#fafafa] text-[#1d1d1f] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
