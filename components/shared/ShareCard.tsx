"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { TaxPolicy, YearData } from "@/lib/types";
import { PROGRAMS_MAP } from "@/lib/data/programs";
import { CURRENT_POLICY } from "@/lib/data/defaults";

// ─── Types ───────────────────────────────────────────────────────────

interface ShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  todayYours: YearData;
  todayActual: YearData;
  shareUrl: string;
  /** Full timeline data for mini chart */
  allData?: YearData[];
  baselineAllData?: YearData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────

function calculateTaxForBrackets(
  income: number,
  brackets: TaxPolicy["brackets"]
): number {
  let tax = 0;
  let remaining = income;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(
      remaining,
      bracket.maxIncome === Infinity
        ? remaining
        : bracket.maxIncome - bracket.minIncome
    );
    tax += taxableInBracket * (bracket.rate / 100);
    remaining -= taxableInBracket;
  }
  return tax;
}

function computeGrade(todayYours: YearData): {
  letter: string;
  color: string;
} {
  const deficit =
    todayYours.spendingBillions - todayYours.revenueBillions;
  const deficitPctGdp =
    (deficit / (todayYours.gdpTrillions * 1000)) * 100;

  if (deficitPctGdp <= 0)
    return { letter: "A+", color: "#34c759" };
  if (deficitPctGdp < 1)
    return { letter: "A", color: "#34c759" };
  if (deficitPctGdp < 3)
    return { letter: "B", color: "#30d158" };
  if (deficitPctGdp < 5)
    return { letter: "C", color: "#ff9500" };
  if (deficitPctGdp < 8)
    return { letter: "D", color: "#ff3b30" };
  return { letter: "F", color: "#ff3b30" };
}

function estimateMedianHouseholdBenefits(enabledPrograms: string[]): number {
  // Median household: 2 adults, 1 kid, 0 students, $75K income
  let total = 0;
  for (const progId of enabledPrograms) {
    switch (progId) {
      case "healthcare":
        total += 2 * 7500; // 2 adults
        break;
      case "college":
        total += 0; // 0 students
        break;
      case "prek":
        total += 10000; // 1 kid
        break;
      case "housing":
        total += 3000; // $75K income => $3000
        break;
      case "ubi":
        total += 2 * 12000; // 2 adults
        break;
      case "infrastructure":
        total += 0;
        break;
    }
  }
  return total;
}

function fmtTrillions(t: number): string {
  return `$${t.toFixed(1)}T`;
}

function fmtBillions(b: number): string {
  const abs = Math.abs(b);
  if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}T`;
  return `$${abs.toFixed(0)}B`;
}

function fmtDollars(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
}

// ─── Canvas drawing ──────────────────────────────────────────────────

const W = 1200;
const H = 630;

function drawCard(
  ctx: CanvasRenderingContext2D,
  props: Omit<ShareCardProps, "open" | "onOpenChange">
) {
  const { taxPolicy, enabledPrograms, todayYours, todayActual, shareUrl } =
    props;

  const grade = computeGrade(todayYours);
  const deficit = todayYours.spendingBillions - todayYours.revenueBillions;
  const debtProjected = todayYours.debtTrillions;

  // Median household impact
  const medianIncome = 75000;
  const taxDefault = calculateTaxForBrackets(
    medianIncome,
    CURRENT_POLICY.brackets
  );
  const taxUser = calculateTaxForBrackets(medianIncome, taxPolicy.brackets);
  const taxChange = taxUser - taxDefault;
  const benefits = estimateMedianHouseholdBenefits(enabledPrograms);
  const netImpact = benefits - taxChange;
  const netPct = ((netImpact / medianIncome) * 100).toFixed(1);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#f0f4ff");
  ctx.fillStyle = grad;
  ctx.beginPath();
  roundRect(ctx, 0, 0, W, H, 0);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Header row
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("\u26A1 SimEcon", 40, 50);

  ctx.fillStyle = "#86868b";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("simecon.app", W - 40, 50);

  // Title
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("MY ECONOMIC POLICY", 40, 100);

  // Divider line under title
  ctx.strokeStyle = "#007AFF";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(380, 115);
  ctx.stroke();

  // ─── Grade / Debt / Deficit row ────────────────────────────────────
  const metricsY = 160;
  const colWidth = 220;

  // Budget Grade
  drawMetricLabel(ctx, 40, metricsY, "BUDGET GRADE");
  ctx.fillStyle = grade.color;
  ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(grade.letter, 40, metricsY + 48);

  // Debt by end
  const debtColor = debtProjected < todayActual.debtTrillions ? "#34c759" : "#ff3b30";
  drawMetricLabel(ctx, 40 + colWidth, metricsY, "DEBT PROJECTED");
  ctx.fillStyle = debtColor;
  ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(fmtTrillions(debtProjected), 40 + colWidth, metricsY + 48);

  // Deficit
  const deficitColor = deficit <= 0 ? "#34c759" : "#ff3b30";
  drawMetricLabel(ctx, 40 + colWidth * 2, metricsY, "ANNUAL DEFICIT");
  ctx.fillStyle = deficitColor;
  ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(
    deficit <= 0 ? `+${fmtBillions(Math.abs(deficit))}/yr` : `${fmtBillions(deficit)}/yr`,
    40 + colWidth * 2,
    metricsY + 48
  );

  // ─── Mini Debt Trajectory Chart ────────────────────────────────────
  const chartX = 40;
  const chartY = 230;
  const chartW = W - 80;
  const chartH = 160;

  // Draw chart background
  ctx.fillStyle = "#f8f9fa";
  roundRect(ctx, chartX, chartY, chartW, chartH, 8);
  ctx.fill();
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  roundRect(ctx, chartX, chartY, chartW, chartH, 8);
  ctx.stroke();

  // Chart label
  ctx.fillStyle = "#86868b";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DEBT TRAJECTORY", chartX + 12, chartY + 18);

  if (props.allData && props.baselineAllData && props.allData.length > 1) {
    const allData = props.allData;
    const baseline = props.baselineAllData;
    const baselineMap = new Map(baseline.map((d) => [d.year, d]));

    // Find min/max for scaling
    let maxDebt = 0;
    for (const d of allData) {
      maxDebt = Math.max(maxDebt, d.debtTrillions);
      const bl = baselineMap.get(d.year);
      if (bl) maxDebt = Math.max(maxDebt, bl.debtTrillions);
    }
    maxDebt = Math.max(maxDebt, 1); // prevent div by zero

    const padLeft = 12;
    const padRight = 12;
    const padTop = 30;
    const padBot = 20;
    const plotW = chartW - padLeft - padRight;
    const plotH = chartH - padTop - padBot;

    const yearMin = allData[0].year;
    const yearMax = allData[allData.length - 1].year;
    const yearRange = Math.max(yearMax - yearMin, 1);

    const toX = (year: number) => chartX + padLeft + ((year - yearMin) / yearRange) * plotW;
    const toY = (debt: number) => chartY + padTop + plotH - (debt / maxDebt) * plotH;

    // Draw baseline (gray dashed)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#c7c7cc";
    ctx.lineWidth = 2;
    let first = true;
    for (const d of allData) {
      const bl = baselineMap.get(d.year);
      if (!bl) continue;
      const x = toX(d.year);
      const y = toY(bl.debtTrillions);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw "yours" line (colored)
    const yourDebtEnd = allData[allData.length - 1].debtTrillions;
    const baselineDebtEnd = baselineMap.get(allData[allData.length - 1].year)?.debtTrillions ?? yourDebtEnd;
    const saving = yourDebtEnd < baselineDebtEnd;
    const lineColor = saving ? "#34c759" : "#ff3b30";

    // Fill area under yours line
    ctx.beginPath();
    for (let i = 0; i < allData.length; i++) {
      const x = toX(allData[i].year);
      const y = toY(allData[i].debtTrillions);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(toX(allData[allData.length - 1].year), chartY + padTop + plotH);
    ctx.lineTo(toX(allData[0].year), chartY + padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = saving ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.1)";
    ctx.fill();

    // Draw yours line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    for (let i = 0; i < allData.length; i++) {
      const x = toX(allData[i].year);
      const y = toY(allData[i].debtTrillions);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Year labels
    ctx.fillStyle = "#86868b";
    ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(yearMin), toX(yearMin), chartY + chartH - 4);
    ctx.fillText(String(yearMax), toX(yearMax), chartY + chartH - 4);

    // Legend
    ctx.textAlign = "right";
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = lineColor;
    ctx.fillText(`Yours: $${yourDebtEnd.toFixed(1)}T`, chartX + chartW - 12, chartY + 18);
    ctx.fillStyle = "#c7c7cc";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`Baseline: $${baselineDebtEnd.toFixed(1)}T`, chartX + chartW - 12, chartY + 32);
  }

  ctx.textAlign = "left";

  // ─── Tax Rates + Programs ──────────────────────────────────────────
  const detailY = chartY + chartH + 20;

  // Tax rates column
  drawMetricLabel(ctx, 40, detailY, "TAX RATES");
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`Top Marginal: ${taxPolicy.topMarginalRate}%`, 40, detailY + 28);
  ctx.fillText(`Corporate: ${taxPolicy.corporateRate}%`, 40, detailY + 52);
  ctx.fillText(`Cap Gains: ${taxPolicy.capitalGainsRate}%`, 40, detailY + 76);
  ctx.fillText(`Estate: ${taxPolicy.estateRate}%`, 40, detailY + 100);

  // Programs column
  drawMetricLabel(ctx, 440, detailY, "PROGRAMS ENABLED");
  const spendingPrograms = enabledPrograms.filter((id) => {
    const p = PROGRAMS_MAP.get(id);
    return p && p.netCostBillions > 0;
  });
  const revenuePrograms = enabledPrograms.filter((id) => {
    const p = PROGRAMS_MAP.get(id);
    return p && p.netCostBillions <= 0;
  });
  const allProgDisplay = [...spendingPrograms, ...revenuePrograms];

  if (allProgDisplay.length === 0) {
    ctx.fillStyle = "#86868b";
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("None", 440, detailY + 28);
  } else {
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const maxShow = Math.min(allProgDisplay.length, 6);
    for (let i = 0; i < maxShow; i++) {
      const prog = PROGRAMS_MAP.get(allProgDisplay[i]);
      if (!prog) continue;
      const isRevenue = prog.netCostBillions <= 0;
      ctx.fillStyle = isRevenue ? "#34c759" : "#1d1d1f";
      const prefix = isRevenue ? "\u2713 " : "\u2713 ";
      // Render in two columns if > 3
      const col = i < 3 ? 0 : 1;
      const row = i < 3 ? i : i - 3;
      ctx.fillText(
        `${prefix}${prog.name}`,
        440 + col * 340,
        detailY + 28 + row * 24
      );
    }
    if (allProgDisplay.length > 6) {
      ctx.fillStyle = "#86868b";
      ctx.fillText(
        `+${allProgDisplay.length - 6} more`,
        440,
        detailY + 28 + 3 * 24
      );
    }
  }

  // ─── Household impact ──────────────────────────────────────────────
  const impactY = detailY + 120;
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, impactY - 20);
  ctx.lineTo(W - 40, impactY - 20);
  ctx.stroke();

  drawMetricLabel(ctx, 40, impactY, "IMPACT ON MEDIAN HOUSEHOLD ($75K)");
  const impactColor = netImpact >= 0 ? "#34c759" : "#ff3b30";
  ctx.fillStyle = impactColor;
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const sign = netImpact >= 0 ? "+" : "-";
  ctx.fillText(
    `Net: ${sign}${fmtDollars(netImpact)}/yr (${netPct}% of income)`,
    40,
    impactY + 40
  );

  // Breakdown
  ctx.fillStyle = "#86868b";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const taxSign = taxChange >= 0 ? "+" : "-";
  ctx.fillText(
    `Tax change: ${taxSign}${fmtDollars(taxChange)}  |  Benefits: +${fmtDollars(benefits)}`,
    40,
    impactY + 68
  );

  // ─── Footer ────────────────────────────────────────────────────────
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, H - 60);
  ctx.lineTo(W - 40, H - 60);
  ctx.stroke();

  ctx.fillStyle = "#007AFF";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("What would YOU do?", 40, H - 30);

  ctx.fillStyle = "#007AFF";
  ctx.font = "18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("simecon.app", W - 40, H - 30);

  ctx.textAlign = "left";
}

function drawMetricLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string
) {
  ctx.fillStyle = "#86868b";
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, x, y);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

// ─── Component ───────────────────────────────────────────────────────

export function ShareCard({
  open,
  onOpenChange,
  taxPolicy,
  enabledPrograms,
  todayYours,
  todayActual,
  shareUrl,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Small delay to let Sheet animation complete and canvas mount
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ensure canvas has correct pixel dimensions
      canvas.width = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);
      drawCard(ctx, {
        taxPolicy,
        enabledPrograms,
        todayYours,
        todayActual,
        shareUrl,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [open, taxPolicy, enabledPrograms, todayYours, todayActual, shareUrl]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "simecon-policy.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>Share Your Policy</SheetTitle>
          <SheetDescription>
            Download a shareable image of your economic policy or copy the link.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Canvas preview */}
          <div className="overflow-hidden rounded-xl border border-[#e5e5ea] shadow-sm">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="w-full"
              style={{ aspectRatio: `${W}/${H}` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 rounded-xl bg-[#007AFF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0066d6] active:bg-[#0055b3]"
            >
              Download Image
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 rounded-xl border border-[#e5e5ea] bg-white px-4 py-3 text-sm font-semibold text-[#007AFF] transition-colors hover:bg-[#f5f5f7] active:bg-[#e5e5ea]"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
