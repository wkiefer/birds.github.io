import type { Detection, AnalysisResult, SpeciesSummary } from "./types";

export function aggregate(
  detections: Detection[],
  filesProcessed: number
): AnalysisResult {
  const filtered = detections.filter((d) => d.speciesCode !== "nocall");

  const groups = new Map<
    string,
    { commonName: string; count: number; totalConfidence: number }
  >();

  for (const d of filtered) {
    const existing = groups.get(d.speciesCode);
    if (existing) {
      existing.count++;
      existing.totalConfidence += d.confidence;
    } else {
      groups.set(d.speciesCode, {
        commonName: d.commonName,
        count: 1,
        totalConfidence: d.confidence,
      });
    }
  }

  const species: SpeciesSummary[] = Array.from(groups.entries())
    .map(([speciesCode, g]) => ({
      speciesCode,
      commonName: g.commonName,
      count: g.count,
      avgConfidence: g.totalConfidence / g.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    uniqueSpeciesCount: species.length,
    totalDetections: filtered.length,
    filesProcessed,
    species,
  };
}
