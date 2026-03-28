"use client";

import type { TaxPolicy } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HouseholdPersonas } from "./HouseholdPersonas";

interface VisualizationTabsProps {
  chartsContent: React.ReactNode;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

export function VisualizationTabs({
  chartsContent,
  taxPolicy,
  enabledPrograms,
}: VisualizationTabsProps) {
  return (
    <Tabs defaultValue="charts">
      <TabsList>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="household">Household Impact</TabsTrigger>
      </TabsList>
      <TabsContent value="charts">
        <div className="space-y-4 pt-2">{chartsContent}</div>
      </TabsContent>
      <TabsContent value="household">
        <div className="pt-2">
          <HouseholdPersonas
            taxPolicy={taxPolicy}
            enabledPrograms={enabledPrograms}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
