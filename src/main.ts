import { parseTSV } from "./parser";
import { aggregate } from "./aggregator";
import type { Detection } from "./types";
import "./style.css";

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const errorsDiv = document.getElementById("errors") as HTMLDivElement;
const summaryDiv = document.getElementById("summary") as HTMLDivElement;
const resultsTable = document.getElementById("results") as HTMLTableElement;
const resultsBody = document.getElementById("results-body") as HTMLTableSectionElement;

fileInput.addEventListener("change", async () => {
  const files = fileInput.files;
  if (!files || files.length === 0) return;

  errorsDiv.innerHTML = "";
  summaryDiv.textContent = "";
  resultsBody.innerHTML = "";
  resultsTable.hidden = true;

  const allDetections: Detection[] = [];
  const allErrors: string[] = [];

  for (const file of files) {
    const text = await file.text();
    const { detections, errors } = parseTSV(text, file.name);
    allDetections.push(...detections);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    errorsDiv.innerHTML = allErrors.map((e) => `<p>${e}</p>`).join("");
  }

  const result = aggregate(allDetections, files.length);

  if (result.totalDetections === 0) {
    summaryDiv.textContent = "No bird detections found.";
    return;
  }

  summaryDiv.textContent = `${result.filesProcessed} file(s) processed. ${result.uniqueSpeciesCount} unique species from ${result.totalDetections} detections.`;
  resultsTable.hidden = false;

  for (const s of result.species) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.commonName}</td><td>${s.count}</td><td>${(s.avgConfidence * 100).toFixed(1)}%</td>`;
    resultsBody.appendChild(tr);
  }
});
