import { describe, it, expect } from "vitest";
import {
  discoverSkills,
  buildDomainIndex,
  getDefaultSkillsDir,
  getRepoSkillsDir,
  getDefaultSkillDirs,
} from "./discovery";
import fs from "fs/promises";

describe("getDefaultSkillsDir", () => {
  it("returns a path that exists", async () => {
    const dir = getDefaultSkillsDir();
    const stat = await fs.stat(dir);
    expect(stat.isDirectory()).toBe(true);
  });

  it("contains built-in skill definitions", async () => {
    const dir = getDefaultSkillsDir();
    const entries = await fs.readdir(dir);
    expect(entries).toContain("deep-research");
    expect(entries).toContain("e-commerce");
    expect(entries).toContain("structured-extraction");
  });
});

describe("discoverSkills", () => {
  it("discovers built-in skills", async () => {
    const skills = await discoverSkills();
    expect(skills.length).toBeGreaterThan(0);

    const names = skills.map((s) => s.name);
    expect(names).toContain("deep-research");
    expect(names).toContain("e-commerce");
  });

  it("returns skill metadata with required fields", async () => {
    const skills = await discoverSkills();
    const deepResearch = skills.find((s) => s.name === "deep-research");

    expect(deepResearch).toBeDefined();
    expect(deepResearch!.description).toBeTruthy();
    expect(deepResearch!.category).toBe("Research");
    expect(deepResearch!.directory).toContain("deep-research");
  });

  it("returns skills without site playbooks when none exist", async () => {
    const skills = await discoverSkills();
    const ecommerce = skills.find((s) => s.name === "e-commerce");

    expect(ecommerce).toBeDefined();
    // site playbooks are optional — e-commerce skill currently has none
    expect(ecommerce!.sitePlaybooks ?? []).toEqual([]);
  });

  it("returns empty array for nonexistent directory", async () => {
    const skills = await discoverSkills("/nonexistent/path");
    expect(skills).toEqual([]);
  });

  it("returns empty array for directory with no valid skills", async () => {
    const skills = await discoverSkills("/tmp");
    expect(skills).toEqual([]);
  });

  it("discovers repo-root Space Age skills by default", async () => {
    const skills = await discoverSkills();
    const names = skills.map((s) => s.name);
    // Built-in framework skill + repo-root Space Age pipeline skills coexist.
    expect(names).toContain("deep-research");
    expect(names).toContain("gsap-supercharged");
    expect(names).toContain("ui-ux-pro-max");
    expect(names).toContain("caveman");
  });

  it("merges multiple directories and de-duplicates by name", async () => {
    // Passing the same directory twice must not produce duplicate entries.
    const single = await discoverSkills(getDefaultSkillsDir());
    const doubled = await discoverSkills([
      getDefaultSkillsDir(),
      getDefaultSkillsDir(),
    ]);
    expect(doubled.length).toBe(single.length);
    const names = doubled.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("skips missing directories when merging", async () => {
    const merged = await discoverSkills([
      getDefaultSkillsDir(),
      "/nonexistent/path",
    ]);
    const builtinOnly = await discoverSkills(getDefaultSkillsDir());
    expect(merged.length).toBe(builtinOnly.length);
  });
});

describe("getRepoSkillsDir / getDefaultSkillDirs", () => {
  it("repo skills dir resolves to a skills/ directory", () => {
    expect(getRepoSkillsDir().endsWith("skills")).toBe(true);
  });

  it("default dirs include both built-in and repo-root skills", () => {
    const dirs = getDefaultSkillDirs();
    expect(dirs).toContain(getDefaultSkillsDir());
    expect(dirs).toContain(getRepoSkillsDir());
  });
});

describe("buildDomainIndex", () => {
  it("indexes site playbooks from built-in skills", async () => {
    const skills = await discoverSkills();
    const index = buildDomainIndex(skills);

    // financial-research ships with sec.gov and finance.yahoo.com playbooks
    expect(index.size).toBeGreaterThan(0);
    expect(index.has("sec.gov")).toBe(true);
    expect(index.has("finance.yahoo.com")).toBe(true);
  });

  it("returns empty map for skills without playbooks", () => {
    const index = buildDomainIndex([
      {
        name: "no-playbooks",
        description: "test",
        directory: "/tmp",
        resources: [],
      },
    ]);
    expect(index.size).toBe(0);
  });
});
