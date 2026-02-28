import { describe, it, expect } from "vitest";
import { aggregate } from "../src/aggregator";
function det(speciesCode, commonName, confidence) {
    return { speciesCode, commonName, confidence, beginTime: 0, endTime: 3 };
}
describe("aggregate", () => {
    it("groups detections by speciesCode and sorts by count descending", () => {
        const detections = [
            det("amegfi", "American Goldfinch", 0.7),
            det("comrav", "Common Raven", 0.8),
            det("comrav", "Common Raven", 0.6),
            det("comrav", "Common Raven", 0.9),
        ];
        const result = aggregate(detections, 1);
        expect(result.uniqueSpeciesCount).toBe(2);
        expect(result.totalDetections).toBe(4);
        expect(result.species[0].speciesCode).toBe("comrav");
        expect(result.species[0].count).toBe(3);
        expect(result.species[1].speciesCode).toBe("amegfi");
        expect(result.species[1].count).toBe(1);
    });
    it("filters out nocall entries", () => {
        const detections = [
            det("nocall", "nocall", 0.99),
            det("amegfi", "American Goldfinch", 0.7),
            det("nocall", "nocall", 0.95),
        ];
        const result = aggregate(detections, 1);
        expect(result.uniqueSpeciesCount).toBe(1);
        expect(result.totalDetections).toBe(1);
        expect(result.species[0].speciesCode).toBe("amegfi");
    });
    it("computes average confidence correctly", () => {
        const detections = [
            det("comrav", "Common Raven", 0.6),
            det("comrav", "Common Raven", 0.8),
        ];
        const result = aggregate(detections, 1);
        expect(result.species[0].avgConfidence).toBeCloseTo(0.7);
    });
    it("returns zero counts for empty input", () => {
        const result = aggregate([], 0);
        expect(result.uniqueSpeciesCount).toBe(0);
        expect(result.totalDetections).toBe(0);
        expect(result.species).toHaveLength(0);
    });
    it("returns zero counts when all detections are nocall", () => {
        const detections = [
            det("nocall", "nocall", 0.99),
            det("nocall", "nocall", 0.95),
        ];
        const result = aggregate(detections, 1);
        expect(result.uniqueSpeciesCount).toBe(0);
        expect(result.totalDetections).toBe(0);
    });
    it("tracks filesProcessed", () => {
        const result = aggregate([det("amegfi", "American Goldfinch", 0.7)], 5);
        expect(result.filesProcessed).toBe(5);
    });
});
