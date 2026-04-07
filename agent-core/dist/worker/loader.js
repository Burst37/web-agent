import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = path.join(__dirname, "prompts", "system.md");
let cache = null;
async function loadRaw() {
  if (cache) return cache;
  cache = (await fs.readFile(PROMPT_PATH, "utf-8")).trim();
  return cache;
}
function interpolate(template, vars) {
  return template.replace(/\{([A-Z_]+)\}/g, (_, key) => vars[key] ?? "");
}
async function loadWorkerPrompt(vars) {
  const template = await loadRaw();
  return interpolate(template, vars);
}
export {
  loadWorkerPrompt
};
