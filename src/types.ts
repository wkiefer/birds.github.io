export interface Detection {
  commonName: string;
  speciesCode: string;
  confidence: number;
  beginTime: number;
  endTime: number;
}

export interface SpeciesSummary {
  speciesCode: string;
  commonName: string;
  count: number;
  avgConfidence: number;
}

export interface AnalysisResult {
  uniqueSpeciesCount: number;
  totalDetections: number;
  filesProcessed: number;
  species: SpeciesSummary[];
}

export interface ParseResult {
  detections: Detection[];
  errors: string[];
}
