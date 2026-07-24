import type { Metadata } from "next";
import { SdDashboard } from "@/components/sd/SdDashboard";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DESCRIPTION =
  "Run the City of San Diego's General Fund: police staffing, pensions, reserves, and the decisions history got wrong. Calibrated to the FY2026 Adopted Budget, IBA reports, and SDCERS valuations.";

/**
 * Metadata is generated per-request so a shared link unfurls with a share-card image of
 * THAT budget: the og:image points at /san-diego/share-image with the same query string.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") qs.set(k, v);
  }
  const image = `/san-diego/share-image${qs.size ? `?${qs.toString()}` : ""}`;
  return {
    title: "SimEcon San Diego - City Budget Sandbox",
    description: DESCRIPTION,
    openGraph: {
      title: "SimEcon San Diego - City Budget Sandbox",
      description: DESCRIPTION,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SimEcon San Diego",
      description: DESCRIPTION,
      images: [image],
    },
  };
}

export default function SanDiegoPage() {
  return <SdDashboard />;
}
