"use client";

import type { TaxPolicy } from "@/lib/types";
import { PERSONAS } from "@/lib/data/personas";
import { PersonaCard } from "./PersonaCard";

interface HouseholdPersonasProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

export function HouseholdPersonas({
  taxPolicy,
  enabledPrograms,
}: HouseholdPersonasProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {PERSONAS.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          taxPolicy={taxPolicy}
          enabledPrograms={enabledPrograms}
        />
      ))}
    </div>
  );
}
