/**
 * Central citation registry. Every number rendered in SimEcon traces to one of these.
 * A Citation is referenced by id from baseline lines, levers, events, and incidence tables.
 */
export interface Citation {
  id: string;
  agency: string;
  dataset: string;
  year: number;
  url: string;
  accessed: string; // ISO date
}

/**
 * SOURCES is populated incrementally by each domain module via registerSources().
 * Keeping one registry means the UI can resolve a citationId to a full source anywhere.
 */
export const SOURCES: Record<string, Citation> = {};

export function registerSources(citations: Citation[]): void {
  for (const c of citations) {
    SOURCES[c.id] = c;
  }
}

export function getCitation(id: string): Citation | undefined {
  return SOURCES[id];
}
