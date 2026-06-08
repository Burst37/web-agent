import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function projectsRoot(): string {
  return path.join(os.homedir(), ".agentic-os", "video-projects");
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "project"
  );
}

export async function createProject(prompt: string, customSlug?: string): Promise<{ slug: string; cwd: string }> {
  const root = projectsRoot();
  await mkdir(root, { recursive: true });

  const base = slugify(customSlug || prompt.split("\n")[0]);
  let slug = base;
  let n = 2;
  while (existsSync(path.join(root, slug))) {
    slug = `${base}-${n++}`;
  }

  const cwd = path.join(root, slug);
  await mkdir(cwd, { recursive: true });
  return { slug, cwd };
}
