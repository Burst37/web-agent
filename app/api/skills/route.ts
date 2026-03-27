import { discoverSkills } from "@/lib/skills/discovery";

export async function GET() {
  const skills = await discoverSkills();
  return Response.json(
    skills.map((s) => ({
      name: s.name,
      description: s.description,
      resources: s.resources,
    })),
  );
}
