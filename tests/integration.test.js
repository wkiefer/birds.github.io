import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseTSV } from "../src/parser";
import { aggregate } from "../src/aggregator";
const EXAMPLES_DIR = join(__dirname, "..", "examples");
describe("integration: example files", () => {
    it("parses all example files without errors", () => {
        const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".txt"));
        expect(files.length).toBe(9);
        const allDetections = [];
        const allErrors = [];
        for (const file of files) {
            const text = readFileSync(join(EXAMPLES_DIR, file), "utf-8");
            const { detections, errors } = parseTSV(text, file);
            allDetections.push(...detections);
            allErrors.push(...errors);
        }
        expect(allErrors).toHaveLength(0);
        expect(allDetections.length).toBeGreaterThan(0);
    });
    it("produces 7 unique species with Belted Kingfisher having the most detections", () => {
        const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".txt"));
        const allDetections = [];
        for (const file of files) {
            const text = readFileSync(join(EXAMPLES_DIR, file), "utf-8");
            const { detections } = parseTSV(text, file);
            allDetections.push(...detections);
        }
        const result = aggregate(allDetections, files.length);
        expect(result.uniqueSpeciesCount).toBe(7);
        expect(result.totalDetections).toBe(67);
        expect(result.filesProcessed).toBe(9);
        expect(result.species[0].speciesCode).toBe("belkin1");
        expect(result.species[0].commonName).toBe("Belted Kingfisher");
        expect(result.species[0].count).toBe(48);
    });
    it("excludes nocall entries from results", () => {
        const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".txt"));
        const allDetections = [];
        for (const file of files) {
            const text = readFileSync(join(EXAMPLES_DIR, file), "utf-8");
            const { detections } = parseTSV(text, file);
            allDetections.push(...detections);
        }
        const result = aggregate(allDetections, files.length);
        const nocall = result.species.find((s) => s.speciesCode === "nocall");
        expect(nocall).toBeUndefined();
    });
});
