"use client";

import { useCallback, useRef, useState } from "react";
import type { YearData, TaxPolicy } from "@/lib/types";

interface VideoExportProps {
  allData: YearData[];
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  shareUrl: string;
}

export function VideoExport({
  allData,
  taxPolicy,
  enabledPrograms,
  shareUrl,
}: VideoExportProps) {
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  const handleExport = useCallback(async () => {
    if (recording) return;
    abortRef.current = false;
    setRecording(true);
    setProgress(0);

    const WIDTH = 1080;
    const HEIGHT = 1920;
    const FPS = 30;
    const FRAMES_PER_YEAR = 15; // 0.5s per year at 30fps

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d")!;

    const stream = canvas.captureStream(FPS);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 4_000_000,
    });
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const done = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: "video/webm" }));
      };
    });

    mediaRecorder.start();

    // Policy summary
    const policyLines = [
      `Top Rate: ${taxPolicy.topMarginalRate}%`,
      `Cap Gains: ${taxPolicy.capitalGainsRate}%`,
      `Corporate: ${taxPolicy.corporateRate}%`,
      `Estate: ${taxPolicy.estateRate}%`,
    ];
    const programText =
      enabledPrograms.length > 0
        ? `Programs: ${enabledPrograms.join(", ")}`
        : "No programs enabled";

    // Max debt for bar chart scaling
    const maxDebt = Math.max(...allData.map((d) => d.debtTrillions), 1);

    for (let i = 0; i < allData.length; i++) {
      if (abortRef.current) break;
      const d = allData[i];
      const pct = Math.round(((i + 1) / allData.length) * 100);
      setProgress(pct);

      for (let f = 0; f < FRAMES_PER_YEAR; f++) {
        // Background
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 64px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SimEcon", WIDTH / 2, 120);

        // Year
        ctx.fillStyle = "#e94560";
        ctx.font = "bold 160px sans-serif";
        ctx.fillText(String(d.year), WIDTH / 2, 340);

        // Policy summary
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        let y = 420;
        for (const line of policyLines) {
          ctx.fillText(line, WIDTH / 2, y);
          y += 44;
        }
        ctx.fillText(programText, WIDTH / 2, y);
        y += 70;

        // Key numbers
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "left";
        const leftMargin = 80;

        ctx.fillText("National Debt", leftMargin, y);
        ctx.fillStyle = "#e94560";
        ctx.font = "bold 56px sans-serif";
        ctx.fillText(`$${d.debtTrillions.toFixed(1)}T`, leftMargin, y + 60);

        y += 120;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("Annual Deficit", leftMargin, y);
        ctx.fillStyle = "#f0a500";
        ctx.font = "bold 56px sans-serif";
        ctx.fillText(
          `$${(d.deficitBillions / 1000).toFixed(2)}T`,
          leftMargin,
          y + 60
        );

        y += 120;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("Debt / GDP", leftMargin, y);
        ctx.fillStyle = d.debtToGdpRatio > 100 ? "#e94560" : "#22c55e";
        ctx.font = "bold 56px sans-serif";
        ctx.fillText(
          `${d.debtToGdpRatio.toFixed(1)}%`,
          leftMargin,
          y + 60
        );

        // Bar chart — debt over time
        y += 130;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Debt Over Time", WIDTH / 2, y);

        const chartTop = y + 20;
        const chartBottom = HEIGHT - 200;
        const chartLeft = 60;
        const chartRight = WIDTH - 60;
        const chartHeight = chartBottom - chartTop;
        const barWidth = (chartRight - chartLeft) / allData.length;

        for (let j = 0; j <= i; j++) {
          const barH = (allData[j].debtTrillions / maxDebt) * chartHeight;
          const x = chartLeft + j * barWidth;
          ctx.fillStyle = j === i ? "#e94560" : "#0f3460";
          ctx.fillRect(x, chartBottom - barH, barWidth - 1, barH);
        }

        // Watermark
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "SimEcon.app \u2014 Try it yourself",
          WIDTH / 2,
          HEIGHT - 60
        );
      }
    }

    mediaRecorder.stop();
    const blob = await done;

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simecon-export.webm";
    a.click();
    URL.revokeObjectURL(url);

    // Copy share text
    try {
      await navigator.clipboard.writeText(
        `I simulated the US economy on SimEcon \u2014 check it out: ${shareUrl}`
      );
    } catch {
      // Clipboard may fail in some browsers; non-critical
    }

    setRecording(false);
    setProgress(0);
  }, [recording, allData, taxPolicy, enabledPrograms, shareUrl]);

  return (
    <button
      onClick={handleExport}
      disabled={recording}
      className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Export video"
    >
      {recording ? `Exporting ${progress}%` : "Export Video"}
    </button>
  );
}
