"use client";

import Link from "next/link";
import SymbolColored from "@/components/shared/icons/symbol-colored";

function Endpoint({
  method,
  path,
  description,
  body,
  response,
}: {
  method: string;
  path: string;
  description: string;
  body?: string;
  response?: string;
}) {
  return (
    <div className="border border-border-faint rounded-12 overflow-hidden">
      <div className="flex items-center gap-10 px-16 py-10 bg-black-alpha-2 border-b border-border-faint">
        <span className="text-label-small font-mono bg-heat-8 text-heat-100 px-8 py-2 rounded-4">
          {method}
        </span>
        <code className="text-mono-small text-accent-black">{path}</code>
      </div>
      <div className="px-16 py-12">
        <p className="text-body-medium text-black-alpha-56 mb-12">{description}</p>
        {body && (
          <div className="mb-10">
            <div className="text-label-x-small text-black-alpha-32 mb-4">Request Body</div>
            <pre className="text-mono-small text-accent-black bg-black-alpha-2 rounded-8 p-12 overflow-auto">{body}</pre>
          </div>
        )}
        {response && (
          <div>
            <div className="text-label-x-small text-black-alpha-32 mb-4">Response</div>
            <pre className="text-mono-small text-accent-black bg-black-alpha-2 rounded-8 p-12 overflow-auto">{response}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background-base">
      <header className="border-b border-border-faint px-20 py-12 flex items-center gap-10">
        <Link href="/" className="flex items-center gap-10 hover:opacity-80 transition-opacity">
          <SymbolColored width={22} height={32} />
          <h1 className="text-title-h5 text-accent-black">Firecrawl Agent</h1>
        </Link>
        <div className="ml-auto flex items-center gap-8">
          <span className="text-label-small text-heat-100 bg-heat-8 px-8 py-4 rounded-6">API Docs</span>
          <a
            href="https://github.com/mendableai/firecrawl-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black-alpha-40 hover:text-accent-black transition-colors"
          >
            <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      <div className="max-w-700 mx-auto px-20 py-32">
        <h2 className="text-title-h3 text-accent-black mb-6">API Reference</h2>
        <p className="text-body-large text-black-alpha-48 mb-24">
          Use these endpoints to run the agent programmatically, manage conversations, and load skills.
        </p>

        <div className="flex flex-col gap-16">
          <Endpoint
            method="POST"
            path="/api/agent"
            description="Run the agent with a prompt. Returns a streaming response with tool calls and text chunks."
            body={`{
  "messages": [{ "role": "user", "content": "Find pricing..." }],
  "config": {
    "prompt": "Find pricing for top 5 cloud providers",
    "model": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-6"
    },
    "urls": [],
    "skills": [],
    "subAgents": [],
    "maxSteps": 20
  }
}`}
            response={`// Server-Sent Events stream
// Each event contains tool calls, text deltas, or results`}
          />

          <Endpoint
            method="GET"
            path="/api/skills"
            description="List all available skills discovered from .agents/skills/ directories."
            response={`[
  {
    "name": "competitive-analysis",
    "description": "Analyze competitors by extracting pricing...",
    "resources": []
  }
]`}
          />

          <Endpoint
            method="GET"
            path="/api/skills/:name"
            description="Get a skill's full instructions by name."
            response={`{
  "name": "competitive-analysis",
  "content": "## Instructions\\n..."
}`}
          />

          <Endpoint
            method="GET"
            path="/api/conversations"
            description="List all saved conversations."
            response={`[
  {
    "id": "conv-123",
    "title": "Find pricing...",
    "created_at": "2025-03-27T..."
  }
]`}
          />

          <Endpoint
            method="POST"
            path="/api/conversations"
            description="Create a new conversation."
            body={`{
  "id": "conv-123",
  "title": "Find pricing for...",
  "config": { ... }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/conversations/:id"
            description="Get a conversation with its messages."
            response={`{
  "id": "conv-123",
  "title": "Find pricing...",
  "config": { ... },
  "messages": [...]
}`}
          />

          <Endpoint
            method="DELETE"
            path="/api/conversations/:id"
            description="Delete a conversation and its messages."
          />
        </div>

        <div className="mt-32 pt-20 border-t border-border-faint">
          <h3 className="text-title-h5 text-accent-black mb-8">Environment Variables</h3>
          <div className="bg-black-alpha-2 rounded-12 p-16">
            <pre className="text-mono-small text-accent-black">{`FIRECRAWL_API_KEY=fc-...        # Required
ANTHROPIC_API_KEY=sk-ant-...   # For Anthropic models
OPENAI_API_KEY=sk-...          # For OpenAI models
GOOGLE_GENERATIVE_AI_API_KEY=  # For Google models`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
