import fs from "fs";
import path from "path";

export interface Signal {
  date: string;
  sequence: string;
  number: string;
  fragment: string;
  color: string;
  sponsored?: boolean;
  sponsorUrl?: string;
}

const EMPTY_SIGNAL: Signal = {
  date: "",
  sequence: "",
  number: "",
  fragment: "",
  color: "#0a0a0a",
};

export function getTodaySignal(): Signal {
  try {
    const contentDir = path.join(process.cwd(), "..", "content");

    // Try to get today's date-specific file (YYYY-MM-DD.json)
    const today = new Date().toISOString().split("T")[0]; // 2026-06-12
    const dateFilePath = path.join(contentDir, `${today}.json`);

    if (fs.existsSync(dateFilePath)) {
      const fileContent = fs.readFileSync(dateFilePath, "utf-8");
      return JSON.parse(fileContent);
    }

    // Fall back to seeds.json
    const seedsPath = path.join(contentDir, "seeds.json");
    if (fs.existsSync(seedsPath)) {
      const seedsContent = fs.readFileSync(seedsPath, "utf-8");
      const seeds: Signal[] = JSON.parse(seedsContent);

      // Find matching date or return the last one
      const matching = seeds.find((s) => s.date === today);
      if (matching) {
        return matching;
      }

      // Return last signal in seeds
      if (seeds.length > 0) {
        return seeds[seeds.length - 1];
      }
    }

    return EMPTY_SIGNAL;
  } catch (error) {
    console.error("Error loading signal:", error);
    return EMPTY_SIGNAL;
  }
}

export function getAllSignals(): Signal[] {
  try {
    const contentDir = path.join(process.cwd(), "..", "content");
    const seedsPath = path.join(contentDir, "seeds.json");

    if (fs.existsSync(seedsPath)) {
      const seedsContent = fs.readFileSync(seedsPath, "utf-8");
      const seeds: Signal[] = JSON.parse(seedsContent);
      // Return in reverse order (newest first)
      return seeds.reverse();
    }

    return [];
  } catch (error) {
    console.error("Error loading signals:", error);
    return [];
  }
}
