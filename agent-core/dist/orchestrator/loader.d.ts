interface OrchestratorPromptVars {
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
declare function loadOrchestratorPrompt(vars: OrchestratorPromptVars): Promise<string>;

export { type OrchestratorPromptVars, loadOrchestratorPrompt };
