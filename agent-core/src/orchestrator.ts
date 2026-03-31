import { ToolLoopAgent, stepCountIs } from "ai";
import { FirecrawlTools } from "firecrawl-aisdk";
import type { AgentConfig } from "./types";
import { resolveModel } from "./resolve-model";
import { createSkillTools } from "./skills/tools";
import { createSubAgentTools } from "./sub-agents";
import { createWorkerTool } from "./workers";
import { formatOutput, bashExec, initBashWithFiles } from "./tools";
import { discoverSkills } from "./skills/discovery";
import { loadOrchestratorPrompt } from "./prompts/loader";

// --- Research plan builder ---

function extractFieldPaths(obj: unknown, prefix = "", depth = 0): string[] {
  if (depth > 4) return [prefix || "(nested)"];
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [`${prefix}[]`];
    const item = obj[0];
    if (typeof item === "object" && item !== null) {
      return extractFieldPaths(item, `${prefix}[]`, depth + 1);
    }
    return [`${prefix}[] (get ALL items)`];
  }
  if (typeof obj === "object" && obj !== null) {
    const paths: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        paths.push(...extractFieldPaths(value, fieldPath, depth + 1));
      } else {
        paths.push(fieldPath);
      }
    }
    return paths;
  }
  return prefix ? [prefix] : [];
}

function buildResearchPlan(
  schema?: Record<string, unknown>,
  columns?: string[],
): string {
  const lines: string[] = [
    "",
    "## Research plan -- required data fields",
    "The user has defined a schema that serves as your research checklist. You MUST find data for every field before presenting results.",
    "",
  ];

  if (schema) {
    lines.push("Target schema:", "```json", JSON.stringify(schema, null, 2), "```", "");
    const fields = extractFieldPaths(schema);
    if (fields.length > 0) {
      lines.push("Data collection checklist:");
      for (const field of fields) {
        lines.push(`- ${field}`);
      }
      lines.push("");
    }
  }

  if (columns?.length) {
    lines.push("Required columns (each is a data point to collect):");
    for (const col of columns) {
      lines.push(`- ${col}`);
    }
    lines.push("");
  }

  lines.push(
    "Do NOT present results until you have attempted every field. If a field cannot be found after searching, set it to null.",
    "When using spawnAgents, include the relevant fields from this checklist in each worker's prompt.",
    "",
  );

  return lines.join("\n");
}

// --- Orchestrator factory ---

export interface OrchestratorOptions {
  config: AgentConfig;
  firecrawlApiKey: string;
  apiKeys?: Record<string, string>;
  skillsDir?: string;
  maxWorkers?: number;
  workerMaxSteps?: number;
}

export async function createOrchestrator(options: OrchestratorOptions) {
  const {
    config,
    firecrawlApiKey,
    apiKeys,
    skillsDir,
    maxWorkers = 6,
    workerMaxSteps = 10,
  } = options;

  const model = await resolveModel(config.model, apiKeys);
  const skills = await discoverSkills(skillsDir);

  const { systemPrompt: fcSystemPrompt, ...fcTools } = FirecrawlTools({
    apiKey: firecrawlApiKey,
  });
  const skillTools = createSkillTools(skills, config.skillInstructions);

  // Resolve sub-agent model (falls back to orchestrator model)
  const subAgentModelResolved = config.subAgentModel
    ? await resolveModel(config.subAgentModel, apiKeys)
    : model;

  const subAgentTools = await createSubAgentTools(
    config.subAgents,
    firecrawlApiKey,
    skills,
    subAgentModelResolved,
    config.skillInstructions,
    apiKeys,
  );

  // Skill catalog for system prompt
  const skillCatalog = skills.length
    ? `\n\nAvailable skills (use load_skill to activate):\n${skills.map((s) => `- ${s.name}: ${s.description.slice(0, 100)}`).join("\n")}`
    : "";

  // Research plan (early in prompt — guides data collection)
  const researchPlan = (config.schema || config.columns)
    ? buildResearchPlan(config.schema, config.columns)
    : "";

  // Slim schema hint (end of prompt — output formatting reminder)
  const schemaHint = config.schema
    ? `\n\nWhen you have gathered ALL data from your research plan, compile it into the exact schema shape and call formatOutput with format "json".`
    : config.columns
      ? `\n\nWhen you have gathered ALL data from your research plan, call formatOutput with format "csv" and columns: ${JSON.stringify(config.columns)}.`
      : "";

  const urlHint =
    config.urls && config.urls.length > 0
      ? `\n\nStart with these URLs: ${config.urls.join(", ")}`
      : "";

  // Pre-seed bash filesystem with uploaded files
  const uploadedFiles: Record<string, string> = {};
  const uploadDescriptions: string[] = [];

  if (config.csvContext) {
    uploadedFiles["/data/input.csv"] = config.csvContext;
    uploadDescriptions.push("/data/input.csv (CSV)");
  }

  if (config.uploads?.length) {
    for (const upload of config.uploads) {
      const isText =
        upload.type.startsWith("text/") ||
        /\.(csv|tsv|json|md|txt|xml|yaml|yml|toml|ini|log|sql|html|css|js|ts|py|rb|sh)$/i.test(
          upload.name,
        );
      const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `/data/${safeName}`;
      if (isText) {
        uploadedFiles[filePath] = upload.content;
      } else {
        uploadedFiles[filePath + ".b64"] = upload.content;
      }
      uploadDescriptions.push(
        `${filePath} (${upload.type || upload.name.split(".").pop()})`,
      );
    }
  }

  if (Object.keys(uploadedFiles).length > 0) {
    await initBashWithFiles(uploadedFiles);
  }

  const uploadHint =
    uploadDescriptions.length > 0
      ? `\n\nThe user uploaded files to the bash filesystem:\n${uploadDescriptions.map((d) => `- ${d}`).join("\n")}\nUse bashExec to explore them: 'head -5 /data/file.csv', 'cat /data/file.json | jq .', 'wc -l /data/file.txt', etc.`
      : "";

  const instructions = await loadOrchestratorPrompt({
    TODAY: new Date().toISOString().split("T")[0],
    FIRECRAWL_SYSTEM_PROMPT: fcSystemPrompt ?? "",
    SKILL_CATALOG: skillCatalog,
    RESEARCH_PLAN: researchPlan,
    SCHEMA_HINT: schemaHint,
    URL_HINTS: urlHint,
    UPLOAD_HINTS: uploadHint,
  });

  const spawnAgents = createWorkerTool(model, firecrawlApiKey, skills, {
    maxWorkers,
    workerMaxSteps,
  });

  return new ToolLoopAgent({
    model,
    instructions,
    tools: {
      ...fcTools,
      ...skillTools,
      ...subAgentTools,
      spawnAgents,
      formatOutput,
      bashExec,
    },
    stopWhen: stepCountIs(config.maxSteps ?? 20),
    experimental_repairToolCall: async ({ toolCall, inputSchema }) => {
      try {
        const schema = await inputSchema({ toolName: toolCall.toolName });
        const allowedKeys = Object.keys(
          (schema as { properties?: Record<string, unknown> }).properties ?? {},
        );
        const parsed = JSON.parse(toolCall.input);
        const cleaned: Record<string, unknown> = {};
        for (const key of allowedKeys) {
          if (key in parsed) cleaned[key] = parsed[key];
        }
        return { ...toolCall, input: JSON.stringify(cleaned) };
      } catch {
        return toolCall;
      }
    },
  });
}
