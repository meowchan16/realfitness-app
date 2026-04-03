import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultData } from "./defaultData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "app-data.json");

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch (_error) {
    await writeFile(dataFile, JSON.stringify(defaultData, null, 2));
  }
}

export async function readStore() {
  await ensureDataFile();

  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return structuredClone(defaultData);
  }
}

export async function writeStore(nextStore) {
  await ensureDataFile();
  await writeFile(dataFile, JSON.stringify(nextStore, null, 2));
  return nextStore;
}
