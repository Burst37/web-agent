import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, "prompts");

let cache: Map<string, string> = new Map();

async function loadPromptFile(name: string): Promise<string> {
  if (cache.has(name)) return cache.get(name)!;
  const content = await fs.readFile(path.join(PROMPTS_DIR, name), "utf-8");
  cache.set(name, content.trim());
  return content.trim();
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{([A-Z_]+)\}/g, (_, key) => vars[key] ?? "");
}

export interface OrchestratorPromptVars {
  TODAY: string;
  FIRECRAWL_SYSTEM_PROMPT: string;
  RESEARCH_PLAN: string;
  WORKFLOW_STEPS: string;
  /** Skill catalog lines (empty string if no skills) */
  SKILL_CATALOG: string;
  /** "inline" or "schema" */
  presentationMode: "inline" | "schema";
  /** For schema mode: format-specific instructions */
  FORMAT_INSTRUCTIONS: string;
  /** Schema JSON block for research plan (empty if no schema) */
  SCHEMA_BLOCK: string;
  /** Field checklist lines (empty if no schema) */
  FIELD_CHECKLIST: string;
  /** Columns block for research plan (empty if no columns) */
  COLUMNS_BLOCK: string;
  /** User-provided URLs hint (empty if none) */
  urlHint: string;
  /** Uploaded files hint (empty if none) */
  uploadHint: string;
}

export async function loadOrchestratorPrompt(vars: OrchestratorPromptVars): Promise<string> {
  // Load all prompt files
  const [system, researchPlan, planning, workflowExamples, skills, presentationInline, presentationSchema] =
    await Promise.all([
      loadPromptFile("system.md"),
      loadPromptFile("research-plan.md"),
      loadPromptFile("workflow-examples.md"),
      loadPromptFile("planning.md"),
      loadPromptFile("skills.md"),
      loadPromptFile("presentation-inline.md"),
      loadPromptFile("presentation-schema.md"),
    ]);

  // Assemble app sections
  const sections: string[] = [planning, workflowExamples];

  // Skills
  sections.push(interpolate(skills, { SKILL_CATALOG: vars.SKILL_CATALOG }));

  // Presentation mode
  if (vars.presentationMode === "schema") {
    sections.push(interpolate(presentationSchema, { FORMAT_INSTRUCTIONS: vars.FORMAT_INSTRUCTIONS }));
  } else {
    sections.push(presentationInline);
  }

  // Research plan (only when schema/columns provided)
  if (vars.SCHEMA_BLOCK || vars.COLUMNS_BLOCK) {
    sections.push(
      interpolate(researchPlan, {
        SCHEMA_BLOCK: vars.SCHEMA_BLOCK,
        FIELD_CHECKLIST: vars.FIELD_CHECKLIST,
        COLUMNS_BLOCK: vars.COLUMNS_BLOCK,
      }),
    );
  }

  // URL hints
  if (vars.urlHint) sections.push(vars.urlHint);

  // Upload hints
  if (vars.uploadHint) sections.push(vars.uploadHint);

  // Interpolate system template with assembled sections
  return interpolate(system, {
    TODAY: vars.TODAY,
    FIRECRAWL_SYSTEM_PROMPT: vars.FIRECRAWL_SYSTEM_PROMPT,
    RESEARCH_PLAN: vars.RESEARCH_PLAN,
    WORKFLOW_STEPS: vars.WORKFLOW_STEPS,
  }) + "\n\n" + sections.join("\n\n");
}
