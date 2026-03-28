import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import fs from "fs/promises";
import path from "path";

const SKILLS_DIR = path.join(process.cwd(), ".agents", "skills");

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  let body: { name: string; messages: unknown[]; prompt: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, messages, prompt } = body;

  const slug = (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return Response.json({ error: "Invalid skill name" }, { status: 400 });
  }

  const transcript = (messages as { role?: string; text?: string; toolName?: string; input?: unknown; output?: unknown }[])
    .map((m) => {
      if (m.role === "user" && m.text) return `USER: ${m.text}`;
      if (m.role === "assistant" && m.text) return `AGENT: ${m.text}`;
      if (m.toolName) {
        const inputStr = m.input ? JSON.stringify(m.input).slice(0, 300) : "";
        const outputStr = m.output ? JSON.stringify(m.output).slice(0, 300) : "";
        return `TOOL [${m.toolName}]: input=${inputStr} output=${outputStr}`;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n");

  try {
    const anthropic = createAnthropic({ apiKey });
    const model = anthropic("claude-sonnet-4-6");

    const { text: skillContent } = await generateText({
      model,
      system: `You generate SKILL.md files for a web research agent powered by Firecrawl.

A skill is a reusable instruction set that teaches the agent how to accomplish a specific type of task.

Given a session transcript, produce a SKILL.md with this exact format:

---
name: skill-name
description: One-line description of what this skill does
---

# Skill Title

## When to Use
Describe when this skill should be loaded.

## Tools Required
List which tools to use: search, scrape, interact, bashExec

## Step-by-Step Instructions
1. First step...
2. Second step...
(Procedural, imperative mood, addressed to the agent)

## Data Extraction
What data to extract and how to structure it.

## Output Format
How the final output should be formatted.

## Tips & Edge Cases
- Common pitfalls observed in the session
- Workarounds that worked

## Example Queries
- "example prompt 1"
- "example prompt 2"

Output ONLY the SKILL.md content. No extra commentary.`,
      prompt: `Original task: ${prompt}\n\nSkill name: ${name}\n\nSession transcript:\n${transcript.slice(0, 8000)}`,
      maxOutputTokens: 2000,
    });

    // Save to disk
    const skillDir = path.join(SKILLS_DIR, slug);
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "SKILL.md"), skillContent, "utf-8");

    return Response.json({
      name: slug,
      path: `.agents/skills/${slug}/SKILL.md`,
      content: skillContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Skills generate error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
