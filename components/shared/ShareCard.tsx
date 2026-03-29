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
import { PROGRAMS, PROGRAMS_MAP } from "@/lib/data/programs";
import { CURRENT_POLICY } from "@/lib/data/defaults";

// --- Types -------------------------------------------------------------------

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

// --- Constants ---------------------------------------------------------------

const W = 1080;
const H = 1920;

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const BLUE = "#007AFF";
const GREEN = "#34c759";
const RED = "#ff3b30";
const GRAY_LABEL = "#86868b";
const GRAY_DIM = "#c7c7cc";
const TEXT_PRIMARY = "#1d1d1f";

const EXPERIMENTAL_IDS = new Set([
  "wealth_tax",
  "sports_betting_tax",
  "robot_tax",
  "sugar_tax",
  "land_value_tax",
  "baby_bonds",
  "mental_health",
  "public_internet",
  "green_jobs",
  "rd_moonshot",
]);

// --- Helpers -----------------------------------------------------------------

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

  if (deficitPctGdp <= 0) return { letter: "A+", color: GREEN };
  if (deficitPctGdp < 1) return { letter: "A", color: GREEN };
  if (deficitPctGdp < 3) return { letter: "B", color: "#30d158" };
  if (deficitPctGdp < 5) return { letter: "C", color: "#ff9500" };
  if (deficitPctGdp < 8) return { letter: "D", color: RED };
  return { letter: "F", color: RED };
}

function estimateMedianHouseholdBenefits(enabledPrograms: string[]): number {
  let total = 0;
  for (const progId of enabledPrograms) {
    switch (progId) {
      case "healthcare":
        total += 2 * 7500;
        break;
      case "college":
        total += 0;
        break;
      case "prek":
        total += 10000;
        break;
      case "housing":
        total += 3000;
        break;
      case "ubi":
        total += 2 * 12000;
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

function fmtCost(netCost: number): string {
  if (netCost < 0) return `+${fmtBillions(Math.abs(netCost))}/yr`;
  return `-${fmtBillions(netCost)}/yr`;
}

function generateExplainer(
  enabledPrograms: string[],
  grade: { letter: string },
  deficit: number,
  netImpact: number
): string {
  const hasHealthcare = enabledPrograms.includes("healthcare");
  const hasUBI = enabledPrograms.includes("ubi");
  const hasRevGenerators = enabledPrograms.some((id) => {
    const p = PROGRAMS_MAP.get(id);
    return p && p.netCostBillions < 0;
  });
  const programCount = enabledPrograms.length;
  const isSurplus = deficit <= 0;

  let explainer = "";

  // Opening based on grade
  if (grade.letter.startsWith("A")) {
    explainer =
      "This policy achieves a balanced or near-balanced budget \u2014 a rare feat. ";
  } else if (grade.letter.startsWith("B")) {
    explainer = "A solid fiscal plan that keeps deficits manageable. ";
  } else if (grade.letter.startsWith("C")) {
    explainer =
      "This plan funds important programs but runs a significant deficit. ";
  } else if (grade.letter.startsWith("D")) {
    explainer =
      "Heavy spending without enough revenue to support it. The debt grows fast. ";
  } else {
    explainer =
      "This policy creates an unsustainable fiscal path. Major revenue increases or spending cuts needed. ";
  }

  // Middle based on what's enabled
  if (programCount === 0) {
    explainer +=
      "No new programs are funded \u2014 this is the status quo with adjusted tax rates. ";
  } else if (hasHealthcare && hasUBI) {
    explainer +=
      "Universal healthcare AND basic income is ambitious \u2014 covering everyone's health and a cash floor. ";
  } else if (hasHealthcare) {
    explainer +=
      "Universal healthcare replaces private insurance with a single-payer system \u2014 no more premiums or deductibles. ";
  } else if (hasUBI) {
    explainer +=
      "Universal basic income provides $1,000/month to every adult \u2014 the most expensive program in the simulator. ";
  } else if (programCount >= 5) {
    explainer += `With ${programCount} programs enabled, this is an ambitious investment in America's future. `;
  } else {
    explainer += `${programCount} targeted program${programCount > 1 ? "s" : ""} funded \u2014 a focused approach. `;
  }

  // Closing based on revenue generators
  if (hasRevGenerators && isSurplus) {
    explainer += "Revenue generators more than cover the spending.";
  } else if (hasRevGenerators) {
    explainer +=
      "Revenue generators help offset costs but don't fully close the gap.";
  } else if (isSurplus) {
    explainer += "Tax revenue alone covers all spending.";
  } else {
    explainer +=
      "Consider adding revenue generators to bring the budget closer to balance.";
  }

  return explainer;
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

function drawMetricLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string
) {
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label, x, y);
}

/** Word-wrap text and return array of lines */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// --- Canvas drawing ----------------------------------------------------------

function drawCard(
  ctx: CanvasRenderingContext2D,
  props: Omit<ShareCardProps, "open" | "onOpenChange">
) {
  const { taxPolicy, enabledPrograms, todayYours, todayActual } = props;

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

  const enabledSet = new Set(enabledPrograms);

  // --- Background gradient ---
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

  const PAD = 48;

  // ==========================================================================
  // 1. HEADER (y: 0-120)
  // ==========================================================================
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 28px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("\u26A1 SimEcon", PAD, 60);

  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `18px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("simecon.app", W - PAD, 60);

  // Blue accent line
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(PAD, 90);
  ctx.lineTo(W - PAD, 90);
  ctx.stroke();

  // ==========================================================================
  // 2. BIG HOOK + GRADE (y: 100-380) — scroll-stopping headline
  // ==========================================================================
  ctx.textAlign = "center";

  // Big hook text — the thing that makes people stop scrolling
  const isSurplus = deficit <= 0;
  const hookText = isSurplus
    ? "I BALANCED THE BUDGET."
    : netImpact > 5000
      ? `+$${Math.round(netImpact).toLocaleString()}/yr FOR THE MEDIAN FAMILY`
      : enabledPrograms.length >= 6
        ? `${enabledPrograms.length} PROGRAMS. CAN YOU DO BETTER?`
        : "HERE'S MY PLAN.";

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `900 54px ${FONT}`;
  const hookLines = wrapText(ctx, hookText, W - PAD * 2);
  for (let i = 0; i < hookLines.length; i++) {
    ctx.fillText(hookLines[i], W / 2, 150 + i * 62);
  }
  const hookBottom = 150 + hookLines.length * 62;

  // Grade — massive, centered
  ctx.fillStyle = grade.color;
  ctx.font = `900 100px ${FONT}`;
  ctx.fillText(grade.letter, W / 2, hookBottom + 90);

  // Grade label
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `bold 18px ${FONT}`;
  ctx.fillText("BUDGET GRADE", W / 2, hookBottom + 118);

  // Explainer text
  const explainer = generateExplainer(enabledPrograms, grade, deficit, netImpact);
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `17px ${FONT}`;
  ctx.textAlign = "center";
  const explainerLines = wrapText(ctx, explainer, W - PAD * 2 - 40);
  for (let i = 0; i < Math.min(explainerLines.length, 3); i++) {
    ctx.fillText(explainerLines[i], W / 2, hookBottom + 150 + i * 24);
  }

  ctx.textAlign = "left";

  // ==========================================================================
  // 3. KEY METRICS ROW — tight after grade/explainer
  // ==========================================================================
  const metricsY = hookBottom + 150 + Math.min(explainerLines.length, 3) * 24 + 20;
  const boxW = (W - PAD * 2 - 24) / 3; // 3 boxes with 12px gaps
  const boxH = 100;

  const metrics = [
    {
      label: "DEBT BY 2050",
      value: fmtTrillions(debtProjected),
      color: debtProjected < todayActual.debtTrillions ? GREEN : RED,
    },
    {
      label: "ANNUAL DEFICIT",
      value:
        deficit <= 0
          ? `+${fmtBillions(Math.abs(deficit))}/yr`
          : `${fmtBillions(deficit)}/yr`,
      color: deficit <= 0 ? GREEN : RED,
    },
    {
      label: "MEDIAN IMPACT",
      value: `${netImpact >= 0 ? "+" : "-"}${fmtDollars(netImpact)}/yr`,
      color: netImpact >= 0 ? GREEN : RED,
    },
  ];

  for (let i = 0; i < 3; i++) {
    const bx = PAD + i * (boxW + 12);
    // Box background
    ctx.fillStyle = "#f8f9fa";
    ctx.beginPath();
    roundRect(ctx, bx, metricsY, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = "#e5e5ea";
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, bx, metricsY, boxW, boxH, 12);
    ctx.stroke();

    // Label
    ctx.fillStyle = GRAY_LABEL;
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(metrics[i].label, bx + 16, metricsY + 30);

    // Value
    ctx.fillStyle = metrics[i].color;
    ctx.font = `bold 34px ${FONT}`;
    ctx.fillText(metrics[i].value, bx + 16, metricsY + 72);
  }

  // ==========================================================================
  // 4. MINI DEBT CHART — tight after metrics
  // ==========================================================================
  const chartX = PAD;
  const chartY = metricsY + boxH + 16;
  const chartW = W - PAD * 2;
  const chartH = 240;

  // Chart background
  ctx.fillStyle = "#f8f9fa";
  ctx.beginPath();
  roundRect(ctx, chartX, chartY, chartW, chartH, 12);
  ctx.fill();
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, chartX, chartY, chartW, chartH, 12);
  ctx.stroke();

  // Chart label
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("DEBT TRAJECTORY", chartX + 16, chartY + 24);

  if (props.allData && props.baselineAllData && props.allData.length > 1) {
    const allData = props.allData;
    const baseline = props.baselineAllData;
    const baselineMap = new Map(baseline.map((d) => [d.year, d]));

    let maxDebt = 0;
    for (const d of allData) {
      maxDebt = Math.max(maxDebt, d.debtTrillions);
      const bl = baselineMap.get(d.year);
      if (bl) maxDebt = Math.max(maxDebt, bl.debtTrillions);
    }
    maxDebt = Math.max(maxDebt, 1);

    const padLeft = 16;
    const padRight = 16;
    const padTop = 40;
    const padBot = 28;
    const plotW = chartW - padLeft - padRight;
    const plotH = chartH - padTop - padBot;

    const yearMin = allData[0].year;
    const yearMax = allData[allData.length - 1].year;
    const yearRange = Math.max(yearMax - yearMin, 1);

    const toX = (year: number) =>
      chartX + padLeft + ((year - yearMin) / yearRange) * plotW;
    const toY = (debt: number) =>
      chartY + padTop + plotH - (debt / maxDebt) * plotH;

    // Baseline (gray dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = GRAY_DIM;
    ctx.lineWidth = 2;
    let first = true;
    for (const d of allData) {
      const bl = baselineMap.get(d.year);
      if (!bl) continue;
      const x = toX(d.year);
      const y = toY(bl.debtTrillions);
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // "Yours" line
    const yourDebtEnd = allData[allData.length - 1].debtTrillions;
    const baselineDebtEnd =
      baselineMap.get(allData[allData.length - 1].year)?.debtTrillions ??
      yourDebtEnd;
    const saving = yourDebtEnd < baselineDebtEnd;
    const lineColor = saving ? GREEN : RED;

    // Fill area under yours line
    ctx.beginPath();
    for (let i = 0; i < allData.length; i++) {
      const x = toX(allData[i].year);
      const y = toY(allData[i].debtTrillions);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(
      toX(allData[allData.length - 1].year),
      chartY + padTop + plotH
    );
    ctx.lineTo(toX(allData[0].year), chartY + padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = saving
      ? "rgba(52,199,89,0.1)"
      : "rgba(255,59,48,0.1)";
    ctx.fill();

    // Yours line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    for (let i = 0; i < allData.length; i++) {
      const x = toX(allData[i].year);
      const y = toY(allData[i].debtTrillions);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Year labels
    ctx.fillStyle = GRAY_LABEL;
    ctx.font = `12px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(String(yearMin), toX(yearMin), chartY + chartH - 6);
    ctx.fillText(String(yearMax), toX(yearMax), chartY + chartH - 6);

    // Legend (top-right)
    ctx.textAlign = "right";
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillStyle = lineColor;
    ctx.fillText(
      `Your Policy: $${yourDebtEnd.toFixed(1)}T`,
      chartX + chartW - 16,
      chartY + 24
    );
    ctx.fillStyle = GRAY_DIM;
    ctx.font = `13px ${FONT}`;
    ctx.fillText(
      `Baseline: $${baselineDebtEnd.toFixed(1)}T`,
      chartX + chartW - 16,
      chartY + 42
    );
  }

  ctx.textAlign = "left";

  // ==========================================================================
  // 5. ALL PROGRAMS CHECKLIST — tight after chart
  // ==========================================================================
  const progsY = chartY + chartH + 24;

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText("PROGRAMS", PAD, progsY);

  // Split programs into three groups
  const spendingProgs = PROGRAMS.filter(
    (p) => p.netCostBillions > 0 && !EXPERIMENTAL_IDS.has(p.id)
  );
  const revenueProgs = PROGRAMS.filter(
    (p) => p.netCostBillions < 0 && !EXPERIMENTAL_IDS.has(p.id)
  );
  const experimentalProgs = PROGRAMS.filter((p) => EXPERIMENTAL_IDS.has(p.id));

  const lineH = 28;
  const progFont = 15;
  const colMid = W / 2;
  const colGap = 16;

  // Two columns: LEFT = costs money, RIGHT = makes money
  const costProgs = [...spendingProgs, ...experimentalProgs.filter((p) => p.netCostBillions > 0)];
  const revProgs = [...revenueProgs, ...experimentalProgs.filter((p) => p.netCostBillions <= 0)];

  function drawProgColumn(
    programs: typeof PROGRAMS,
    startX: number,
    endX: number,
    startY: number
  ): number {
    let y = startY;
    for (const prog of programs) {
      const enabled = enabledSet.has(prog.id);
      const icon = enabled ? "\u2705" : "\u274C";
      const nameColor = enabled ? TEXT_PRIMARY : GRAY_DIM;
      const costColor = prog.netCostBillions < 0
        ? (enabled ? GREEN : GRAY_DIM)
        : (enabled ? RED : GRAY_DIM);

      // Icon + name
      ctx.font = `16px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(icon, startX, y);
      ctx.fillStyle = nameColor;
      ctx.font = `${progFont}px ${FONT}`;
      ctx.fillText(prog.name, startX + 22, y);

      // Cost right-aligned within column
      ctx.fillStyle = costColor;
      ctx.font = `bold ${progFont}px ${FONT}`;
      ctx.textAlign = "right";
      ctx.fillText(fmtCost(prog.netCostBillions), endX, y);

      y += lineH;
    }
    return y;
  }

  // Column headers
  let curY = progsY + 28;
  ctx.fillStyle = RED;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("COSTS MONEY", PAD, curY);
  ctx.fillStyle = GREEN;
  ctx.fillText("MAKES MONEY", colMid + colGap, curY);
  curY += lineH;

  // Draw both columns
  const leftBottom = drawProgColumn(costProgs, PAD, colMid - colGap, curY);
  const rightBottom = drawProgColumn(revProgs, colMid + colGap, W - PAD, curY);
  curY = Math.max(leftBottom, rightBottom);

  // ==========================================================================
  // 6. TAX RATES — tight after programs
  // ==========================================================================
  const taxY = curY + 24;

  // Separator line
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, taxY - 16);
  ctx.lineTo(W - PAD, taxY - 16);
  ctx.stroke();

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 20px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("TAX RATES", PAD, taxY);

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `20px ${FONT}`;
  ctx.fillText(
    `Top: ${taxPolicy.topMarginalRate}%  \u00B7  Corp: ${taxPolicy.corporateRate}%  \u00B7  Cap Gains: ${taxPolicy.capitalGainsRate}%  \u00B7  Estate: ${taxPolicy.estateRate}%`,
    PAD,
    taxY + 38
  );

  // ==========================================================================
  // 7. HOUSEHOLD IMPACT — tight after tax rates
  // ==========================================================================
  const impactY = taxY + 60;

  // Separator
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, impactY - 10);
  ctx.lineTo(W - PAD, impactY - 10);
  ctx.stroke();

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 20px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("IMPACT ON MEDIAN HOUSEHOLD ($75K)", PAD, impactY + 10);

  // Big impact number
  const impactColor = netImpact >= 0 ? GREEN : RED;
  const impactSign = netImpact >= 0 ? "+" : "-";
  ctx.fillStyle = impactColor;
  ctx.font = `bold 48px ${FONT}`;
  ctx.fillText(
    `${impactSign}${fmtDollars(netImpact)}/yr (${netPct}% raise)`,
    PAD,
    impactY + 68
  );

  // Breakdown
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `18px ${FONT}`;
  const taxSign = taxChange >= 0 ? "+" : "-";
  ctx.fillText(
    `Tax change: ${taxSign}${fmtDollars(taxChange)}  |  Benefits: +${fmtDollars(benefits)}`,
    PAD,
    impactY + 100
  );

  // ==========================================================================
  // 8. FOOTER (y: 1740-1920)
  // ==========================================================================

  // Separator
  ctx.strokeStyle = "#e5e5ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, H - 160);
  ctx.lineTo(W - PAD, H - 160);
  ctx.stroke();

  // "What would YOU do?" left
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 28px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("What would YOU do?", PAD, H - 100);

  // "simecon.app" right
  ctx.fillStyle = GRAY_LABEL;
  ctx.font = `22px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("simecon.app", W - PAD, H - 100);

  // "Try it yourself ->" center, blue
  ctx.fillStyle = BLUE;
  ctx.font = `bold 26px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("Try it yourself \u2192", W / 2, H - 50);

  ctx.textAlign = "left";
}

// --- Component ---------------------------------------------------------------

export function ShareCard({
  open,
  onOpenChange,
  taxPolicy,
  enabledPrograms,
  todayYours,
  todayActual,
  shareUrl,
  allData,
  baselineAllData,
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
        allData,
        baselineAllData,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [
    open,
    taxPolicy,
    enabledPrograms,
    todayYours,
    todayActual,
    shareUrl,
    allData,
    baselineAllData,
  ]);

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
            Download a shareable image of your economic policy or copy the
            link.
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
