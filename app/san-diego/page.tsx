import type { Metadata } from "next";
import { SdDashboard } from "@/components/sd/SdDashboard";

export const metadata: Metadata = {
  title: "SimEcon San Diego - City Budget Sandbox",
  description:
    "Run the City of San Diego's General Fund: police staffing, pensions, reserves, and the decisions history got wrong. Calibrated to the FY2026 Adopted Budget, IBA reports, and SDCERS valuations.",
};

export default function SanDiegoPage() {
  return <SdDashboard />;
}
