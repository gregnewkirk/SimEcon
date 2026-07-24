"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Link2, ImageDown, Check } from "lucide-react";
import type { SdLeverConfig } from "@/lib/sd/types";
import { encodeSdState, changedLevers } from "@/lib/sd/url-state";
import { moneyM } from "./format";
import { C, SHADOW, SPRING } from "@/components/sim/theme";

/**
 * The big share strip: one tap turns your budget into a link (the URL encodes every
 * slider), a 1200x630 share-card image, and prefilled posts. The link unfurls with the
 * card automatically because the page's og:image points at /san-diego/share-image with
 * the same params.
 */
export function SdShareBar({
  cfg,
  mode,
  events,
  gapM,
  savedM,
}: {
  cfg: SdLeverConfig;
  mode: "fix" | "whatif";
  events: string[];
  gapM: number;
  savedM: number;
}) {
  const [copied, setCopied] = useState(false);

  const changes = changedLevers(cfg).length;
  const summary =
    mode === "whatif"
      ? `San Diego would have ${moneyM(savedM)} today if it had decided differently. I checked.`
      : gapM < 0
        ? `I balanced San Diego's budget with ${moneyM(-gapM)} to spare (${changes} change${changes === 1 ? "" : "s"}). Your turn.`
        : `My San Diego budget: ${changes} change${changes === 1 ? "" : "s"}, ${moneyM(gapM)} still to close. Think you can beat it?`;

  const shareUrl = () => {
    const qs = encodeSdState(cfg, mode, events).toString();
    return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
  };
  const imageUrl = () => {
    const qs = encodeSdState(cfg, mode, events).toString();
    return `${window.location.origin}/san-diego/share-image${qs ? `?${qs}` : ""}`;
  };

  const nativeShare = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: "SimEcon San Diego", text: summary, url });
        return;
      } catch {
        /* user dismissed - fall through to copy */
      }
    }
    await copyLink();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${summary} ${shareUrl()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const intent = (base: string) =>
    `${base}${encodeURIComponent(`${summary} ${shareUrl()}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4"
      style={{ background: C.card, boxShadow: SHADOW }}
    >
      <div className="min-w-0">
        <div className="text-lg font-bold" style={{ color: C.ink }}>
          Show off your budget
        </div>
        <div className="truncate text-[13px]" style={{ color: C.inkMute }}>
          {summary}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={nativeShare}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-semibold text-white"
          style={{ background: C.accent, boxShadow: SHADOW }}
        >
          <Share2 className="size-4" /> Share
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-medium"
          style={{ background: "#F0F0F3", color: copied ? C.green : C.ink }}
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          {copied ? "Copied!" : "Copy link"}
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.95 }}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(imageUrl(), "_blank");
          }}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-medium"
          style={{ background: "#F0F0F3", color: C.ink }}
        >
          <ImageDown className="size-4" /> Image
        </motion.a>
        <SocialChip label="𝕏" href={() => intent("https://twitter.com/intent/tweet?text=")} />
        <SocialChip label="Bluesky" href={() => intent("https://bsky.app/intent/compose?text=")} />
        <SocialChip label="Facebook" href={() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`} />
      </div>
    </motion.div>
  );
}

function SocialChip({ label, href }: { label: string; href: () => string }) {
  return (
    <motion.a
      whileTap={{ scale: 0.95 }}
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.open(href(), "_blank", "noopener,width=600,height=500");
      }}
      className="rounded-full px-3.5 py-2.5 text-[13px] font-medium"
      style={{ background: "#F0F0F3", color: C.ink }}
    >
      {label}
    </motion.a>
  );
}
