import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, "prompts");
let cache = /* @__PURE__ */ new Map();
async function loadPromptFile(name) {
  if (cache.has(name)) return cache.get(name);
  const content = await fs.readFile(path.join(PROMPTS_DIR, name), "utf-8");
  cache.set(name, content.trim());
  return content.trim();
}
function interpolate(template, vars) {
  return template.replace(/\{([A-Z_]+)\}/g, (_, key) => vars[key] ?? "");
}
async function loadOrchestratorPrompt(vars) {
  const [system, researchPlan, planning, workflowExamples, skills, presentationInline, presentationSchema] = await Promise.all([
    loadPromptFile("system.md"),
    loadPromptFile("research-plan.md"),
    loadPromptFile("workflow-examples.md"),
    loadPromptFile("planning.md"),
    loadPromptFile("skills.md"),
    loadPromptFile("presentation-inline.md"),
    loadPromptFile("presentation-schema.md")
  ]);
  const sections = [planning, workflowExamples];
  sections.push(interpolate(skills, { SKILL_CATALOG: vars.SKILL_CATALOG }));
  if (vars.presentationMode === "schema") {
    sections.push(interpolate(presentationSchema, { FORMAT_INSTRUCTIONS: vars.FORMAT_INSTRUCTIONS }));
  } else {
    sections.push(presentationInline);
  }
  if (vars.SCHEMA_BLOCK || vars.COLUMNS_BLOCK) {
    sections.push(
      interpolate(researchPlan, {
        SCHEMA_BLOCK: vars.SCHEMA_BLOCK,
        FIELD_CHECKLIST: vars.FIELD_CHECKLIST,
        COLUMNS_BLOCK: vars.COLUMNS_BLOCK
      })
    );
  }
  if (vars.urlHint) sections.push(vars.urlHint);
  if (vars.uploadHint) sections.push(vars.uploadHint);
  return interpolate(system, {
    TODAY: vars.TODAY,
    FIRECRAWL_SYSTEM_PROMPT: vars.FIRECRAWL_SYSTEM_PROMPT,
    RESEARCH_PLAN: vars.RESEARCH_PLAN,
    WORKFLOW_STEPS: vars.WORKFLOW_STEPS
  }) + "\n\n" + sections.join("\n\n");
}
export {
  loadOrchestratorPrompt
};
