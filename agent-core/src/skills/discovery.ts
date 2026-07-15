import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { SkillMetadata, SitePlaybook } from "../types";
import { parseSkillFrontmatter } from "./parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SKILLS_DIR = path.join(__dirname, "definitions");
// Space Age pipeline skills live at the repo root (web-agent/skills/), alongside
// agent-core rather than inside it. Resolved relative to this module:
// agent-core/src/skills -> ../../../skills. When agent-core is published/vendored
// without a sibling skills/ dir, this path simply doesn't exist and is skipped.
const REPO_SKILLS_DIR = path.join(__dirname, "..", "..", "..", "skills");

/** Returns the path to the built-in skills directory. */
export function getDefaultSkillsDir(): string {
  return DEFAULT_SKILLS_DIR;
}

/** Returns the path to the repo-root Space Age skills directory. */
export function getRepoSkillsDir(): string {
  return REPO_SKILLS_DIR;
}

/**
 * The directories discoverSkills scans by default: the framework's built-in
 * skills plus the repo-root Space Age pipeline skills. Missing directories are
 * skipped, so this is safe when agent-core is consumed standalone.
 */
export function getDefaultSkillDirs(): string[] {
  return [DEFAULT_SKILLS_DIR, REPO_SKILLS_DIR];
}

async function discoverSitePlaybooks(skillDir: string): Promise<SitePlaybook[]> {
  const sitesDir = path.join(skillDir, "sites");
  try {
    const files = await fs.readdir(sitesDir);
    const playbooks: SitePlaybook[] = [];
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const filePath = path.join(sitesDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const meta = parseSkillFrontmatter(content);
      if (meta.domains?.length) {
        playbooks.push({
          name: file.replace(/\.md$/, ""),
          platform: meta.platform || file.replace(/\.md$/, ""),
          domains: meta.domains,
          filePath,
        });
      }
    }
    return playbooks;
  } catch {
    return [];
  }
}

/**
 * Discover skills from one or more directories.
 *
 * Accepts a single directory or a list. When given a list, results are merged
 * and de-duplicated by skill name (earlier directories win), so the built-in
 * framework skills take precedence over any repo-root skill of the same name.
 * Defaults to the framework + repo-root Space Age skill directories.
 */
export async function discoverSkills(
  skillsDir: string | string[] = getDefaultSkillDirs(),
): Promise<SkillMetadata[]> {
  const dirs = Array.isArray(skillsDir) ? skillsDir : [skillsDir];
  const skills: SkillMetadata[] = [];
  const seen = new Set<string>();

  for (const dir of dirs) {
    for (const skill of await discoverSkillsInDir(dir)) {
      if (seen.has(skill.name)) continue;
      seen.add(skill.name);
      skills.push(skill);
    }
  }

  return skills;
}

async function discoverSkillsInDir(skillsDir: string): Promise<SkillMetadata[]> {
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const skills: SkillMetadata[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = path.join(skillsDir, entry.name);
      const skillFile = path.join(skillDir, "SKILL.md");

      try {
        const content = await fs.readFile(skillFile, "utf-8");
        const meta = parseSkillFrontmatter(content);

        const files = await fs.readdir(skillDir);
        const resources = files.filter(
          (f) => f !== "SKILL.md" && !f.startsWith(".") && f !== "sites",
        );

        const sitePlaybooks = await discoverSitePlaybooks(skillDir);

        skills.push({
          name: meta.name || entry.name,
          description: meta.description || "",
          category: meta.category,
          directory: skillDir,
          resources,
          sitePlaybooks: sitePlaybooks.length > 0 ? sitePlaybooks : undefined,
        });
      } catch {
        // Skip directories without valid SKILL.md
      }
    }

    return skills;
  } catch {
    return [];
  }
}

/**
 * Build a domain -> site playbook lookup from all discovered skills.
 */
export function buildDomainIndex(
  skills: SkillMetadata[],
): Map<string, { skill: SkillMetadata; playbook: SitePlaybook }> {
  const index = new Map<string, { skill: SkillMetadata; playbook: SitePlaybook }>();
  for (const skill of skills) {
    for (const pb of skill.sitePlaybooks ?? []) {
      for (const domain of pb.domains) {
        index.set(domain.toLowerCase(), { skill, playbook: pb });
      }
    }
  }
  return index;
}
