import { describe, it, expect } from "vitest";
import { parseTSV } from "../src/parser";

const HEADER =
  "Selection\tView\tChannel\tBegin Time (s)\tEnd Time (s)\tLow Freq (Hz)\tHigh Freq (Hz)\tCommon Name\tSpecies Code\tConfidence\tBegin Path\tFile Offset (s)";

function makeLine(
  commonName: string,
  speciesCode: string,
  confidence: number
): string {
  return `1\tSpectrogram 1\t1\t0.0\t3.0\t0\t12000.0\t${commonName}\t${speciesCode}\t${confidence}\tpath.wav\t0.0`;
}

describe("parseTSV", () => {
  it("parses a valid TSV with one detection", () => {
    const text = HEADER + "\n" + makeLine("American Goldfinch", "amegfi", 0.85);
    const { detections, errors } = parseTSV(text, "test.txt");
    expect(errors).toHaveLength(0);
    expect(detections).toHaveLength(1);
    expect(detections[0]).toEqual({
      commonName: "American Goldfinch",
      speciesCode: "amegfi",
      confidence: 0.85,
      beginTime: 0.0,
      endTime: 3.0,
    });
  });

  it("parses multiple detections", () => {
    const text = [
      HEADER,
      makeLine("Common Raven", "comrav", 0.7),
      makeLine("American Goldfinch", "amegfi", 0.65),
    ].join("\n");
    const { detections, errors } = parseTSV(text, "test.txt");
    expect(errors).toHaveLength(0);
    expect(detections).toHaveLength(2);
  });

  it("handles \\r\\n line endings", () => {
    const text =
      HEADER + "\r\n" + makeLine("Common Raven", "comrav", 0.7) + "\r\n";
    const { detections, errors } = parseTSV(text, "test.txt");
    expect(errors).toHaveLength(0);
    expect(detections).toHaveLength(1);
  });

  it("skips blank lines", () => {
    const text = HEADER + "\n\n" + makeLine("Common Raven", "comrav", 0.7) + "\n\n";
    const { detections, errors } = parseTSV(text, "test.txt");
    expect(errors).toHaveLength(0);
    expect(detections).toHaveLength(1);
  });

  it("returns error for non-TSV content", () => {
    const { detections, errors } = parseTSV("hello world", "bad.txt");
    expect(detections).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("bad.txt");
    expect(errors[0]).toContain("tab-separated BirdNET format");
  });

  it("returns error for empty file", () => {
    const { detections, errors } = parseTSV("", "empty.txt");
    expect(detections).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("empty.txt");
  });

  it("returns error when header is valid but no data rows produce detections", () => {
    const text = HEADER + "\n";
    const { detections, errors } = parseTSV(text, "headeronly.txt");
    expect(detections).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("no valid detections");
  });

  it("skips lines with fewer than 12 columns", () => {
    const text = HEADER + "\n" + "short\tline" + "\n" + makeLine("Common Raven", "comrav", 0.7);
    const { detections } = parseTSV(text, "test.txt");
    expect(detections).toHaveLength(1);
  });
});
