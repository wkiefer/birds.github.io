import type { Detection, ParseResult } from "./types";

export function parseTSV(text: string, filename: string): ParseResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const detections: Detection[] = [];
  const errors: string[] = [];

  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
    errors.push(`${filename}: file is empty or has no data rows`);
    return { detections, errors };
  }

  const header = lines[0].split("\t");
  if (header.length < 12 || !header.includes("Species Code")) {
    errors.push(
      `${filename}: could not parse, expected tab-separated BirdNET format`
    );
    return { detections, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    const cols = line.split("\t");
    if (cols.length < 12) continue;

    const confidence = parseFloat(cols[9]);
    if (isNaN(confidence)) continue;

    detections.push({
      beginTime: parseFloat(cols[3]),
      endTime: parseFloat(cols[4]),
      commonName: cols[7],
      speciesCode: cols[8],
      confidence,
    });
  }

  if (detections.length === 0) {
    errors.push(`${filename}: no valid detections found`);
  }

  return { detections, errors };
}
