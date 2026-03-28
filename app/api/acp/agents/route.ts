import { detectACPAgents } from "@/lib/agents/acp";

export async function GET() {
  const agents = detectACPAgents();
  return Response.json(agents);
}
