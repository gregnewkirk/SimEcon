"use client";

import type { TaxPolicy, AdvancedAssumptions, YearData } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HouseholdImpact } from "./HouseholdImpact";
import { WaterfallChart } from "./WaterfallChart";
import { RevenueSpendingChart } from "./RevenueSpendingChart";
import { TornadoChart } from "./TornadoChart";

interface VisualizationTabsProps {
  chartsContent: React.ReactNode;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  assumptions: AdvancedAssumptions;
  currentYearData: YearData;
  allData: YearData[];
  currentYear: number;
}

export function VisualizationTabs({
  chartsContent,
  taxPolicy,
  enabledPrograms,
  assumptions,
  currentYearData,
  allData,
  currentYear,
}: VisualizationTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
        <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        <TabsTrigger value="household">Household Impact</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-4 pt-2">{chartsContent}</div>
      </TabsContent>
      <TabsContent value="budget">
        <div className="space-y-4 pt-2">
          <WaterfallChart yearData={currentYearData} />
          <RevenueSpendingChart data={allData} currentYear={currentYear} />
        </div>
      </TabsContent>
      <TabsContent value="sensitivity">
        <div className="pt-2">
          <TornadoChart
            taxPolicy={taxPolicy}
            assumptions={assumptions}
            currentYearData={currentYearData}
          />
        </div>
      </TabsContent>
      <TabsContent value="household">
        <div className="pt-2">
          <HouseholdImpact
            taxPolicy={taxPolicy}
            enabledPrograms={enabledPrograms}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
