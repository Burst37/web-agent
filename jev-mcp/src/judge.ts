const API_URL = "https://api.typesafe.ai/v1/systemone";
const DEFAULT_MODEL = "jev-latest";
const DEFAULT_TIMEOUT_MS = 2_000;

export type State = string | Record<string, unknown> | unknown[];
export type Instructions = string | Record<string, unknown> | unknown[];

export type Question =
  | { type: "noul"; instructions: Instructions; criteria?: { true: string; false: string } }
  | { type: "choice"; instructions: Instructions; criteria: Record<string, string> }
  | { type: "score"; instructions: Instructions; criteria: string[] };

export type NoulAnswer = { type: "noul"; noul: number };
export type ChoiceAnswer = {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};
export type ScoreAnswer = {
  type: "score";
  score: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
};
export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export type JudgeRequest = {
  state: State;
  questions: Record<string, Question>;
  model?: string;
  timeoutMs?: number;
};

export type JudgeSuccess = {
  ok: true;
  answers: Record<string, Answer>;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
  latencyMs: number;
};

/**
 * Callers MUST treat this as "escalate to the frontier model", never as a denial
 * or a negative answer. A judgment layer that fails closed turns a vendor blip
 * into an outage.
 */
export type JudgeBypass = {
  ok: false;
  reason: "no_api_key" | "timeout" | "http_error" | "network_error" | "bad_response";
  detail: string;
  latencyMs: number;
};

export type JudgeResult = JudgeSuccess | JudgeBypass;

/**
 * Noul has no confidence field — the probability IS the answer. Distance off 0.5
 * is the only available certainty signal, normalised so it compares to the
 * `confidence` that Choice and Score return.
 */
export function noulCertainty(noul: number): number {
  return Math.abs(noul - 0.5) * 2;
}

export function certaintyOf(answer: Answer): number {
  return answer.type === "noul" ? noulCertainty(answer.noul) : answer.confidence;
}

export async function judge(req: JudgeRequest): Promise<JudgeResult> {
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "no_api_key",
      detail: "TYPESAFE_API_KEY is not set",
      latencyMs: elapsed(),
    };
  }

  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: req.state,
        model: req.model ?? DEFAULT_MODEL,
        questions: req.questions,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        reason: "http_error",
        detail: `${response.status} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ""}`,
        latencyMs: elapsed(),
      };
    }

    const payload = (await response.json()) as {
      model?: string;
      answers?: Record<string, Answer>;
      usage?: { input_tokens: number; output_tokens: number };
    };

    if (!payload.answers) {
      return {
        ok: false,
        reason: "bad_response",
        detail: "response contained no answers object",
        latencyMs: elapsed(),
      };
    }

    return {
      ok: true,
      answers: payload.answers,
      usage: payload.usage ?? { input_tokens: 0, output_tokens: 0 },
      model: payload.model ?? (req.model ?? DEFAULT_MODEL),
      latencyMs: elapsed(),
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      reason: aborted ? "timeout" : "network_error",
      detail: aborted ? `aborted after ${timeoutMs}ms` : String(error),
      latencyMs: elapsed(),
    };
  } finally {
    clearTimeout(timer);
  }
}
