"use client";

import { useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TaxSlider } from "@/components/sidebar/TaxSlider";
import { DEFAULT_ASSUMPTIONS } from "@/lib/data/defaults";
import type { AdvancedAssumptions } from "@/lib/types";

interface ShowYourWorkProps {
  assumptions: AdvancedAssumptions;
  onAssumptionsChange: (field: keyof AdvancedAssumptions, value: number) => void;
  onReset: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShowYourWork({
  assumptions,
  onAssumptionsChange,
  onReset,
  open,
  onOpenChange,
}: ShowYourWorkProps) {
  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(assumptions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simecon-assumptions.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [assumptions]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-96 overflow-y-auto border-zinc-800 bg-[var(--simecon-bg-sidebar)]"
      >
        <SheetHeader>
          <SheetTitle className="text-zinc-100">
            Show Your Work
          </SheetTitle>
          <SheetDescription className="text-zinc-500">
            Adjust model assumptions and review methodology.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Adjustable assumption sliders */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Assumptions
            </h3>
            <TaxSlider
              label="GDP Growth Rate"
              value={assumptions.gdpGrowthRate}
              defaultValue={DEFAULT_ASSUMPTIONS.gdpGrowthRate}
              onChange={(v) => onAssumptionsChange("gdpGrowthRate", v)}
              min={0}
              max={5}
              step={0.1}
              suffix="%"
              color="#0f3460"
            />
            <TaxSlider
              label="Interest Rate"
              value={assumptions.interestRate}
              defaultValue={DEFAULT_ASSUMPTIONS.interestRate}
              onChange={(v) => onAssumptionsChange("interestRate", v)}
              min={1}
              max={8}
              step={0.1}
              suffix="%"
              color="#f0a500"
            />
            <TaxSlider
              label="Behavioral Elasticity"
              value={assumptions.behavioralElasticity}
              defaultValue={DEFAULT_ASSUMPTIONS.behavioralElasticity}
              onChange={(v) => onAssumptionsChange("behavioralElasticity", v)}
              min={0}
              max={1}
              step={0.01}
              suffix=""
              color="#533483"
            />
            <TaxSlider
              label="Fiscal Multiplier"
              value={assumptions.fiscalMultiplier}
              defaultValue={DEFAULT_ASSUMPTIONS.fiscalMultiplier}
              onChange={(v) => onAssumptionsChange("fiscalMultiplier", v)}
              min={0.5}
              max={2.5}
              step={0.1}
              suffix="x"
              color="#e94560"
            />
          </section>

          {/* Methodology section */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Methodology
            </h3>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-xs leading-relaxed text-zinc-400">
              <p>
                <strong className="text-zinc-300">Tax Revenue:</strong> Computed
                as effective-rate x taxable-base, adjusted for behavioral
                elasticity (Laffer-curve feedback). Higher elasticity means more
                revenue loss from rate increases.
              </p>
              <p>
                <strong className="text-zinc-300">Wealth Redistribution:</strong>{" "}
                Program spending shifts wealth shares across brackets using a
                simplified transfer model proportional to net program cost.
              </p>
              <p>
                <strong className="text-zinc-300">GDP Feedback:</strong> Fiscal
                multiplier scales the GDP impact of spending changes. A
                multiplier of 1.2 means each $1 of spending generates $1.20 of
                GDP. GDP growth rate sets the baseline trajectory.
              </p>
              <p>
                <strong className="text-zinc-300">Debt Dynamics:</strong> Debt
                accumulates via deficits and interest payments. The interest rate
                assumption drives the cost of servicing existing debt.
              </p>
              <p>
                <strong className="text-zinc-300">Known Limitations:</strong>{" "}
                This is a simplified educational model. It does not capture
                monetary policy, trade dynamics, demographic shifts, or
                second-order behavioral effects. All projections are illustrative,
                not predictive.
              </p>
            </div>
          </section>

          {/* Export & Reset */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Export
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              >
                Export as PDF
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              >
                Export as JSON
              </button>
            </div>
            <button
              onClick={onReset}
              className="w-full rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-red-400 transition-colors hover:border-red-500/50 hover:text-red-300"
            >
              Reset All to Defaults
            </button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
