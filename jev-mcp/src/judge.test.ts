import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { certaintyOf, judge, noulCertainty } from "./judge.js";

const originalKey = process.env.TYPESAFE_API_KEY;

beforeEach(() => {
  process.env.TYPESAFE_API_KEY = "test-key";
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.TYPESAFE_API_KEY;
  else process.env.TYPESAFE_API_KEY = originalKey;
  vi.unstubAllGlobals();
});

const choiceQuestion = {
  q: {
    type: "choice" as const,
    instructions: "Which team handles this?",
    criteria: { billing: "Payments", technical: "Bugs" },
  },
};

describe("noulCertainty", () => {
  it("treats 0.5 as maximally uncertain", () => {
    expect(noulCertainty(0.5)).toBe(0);
  });

  it("treats both extremes as maximally certain", () => {
    expect(noulCertainty(1)).toBe(1);
    expect(noulCertainty(0)).toBe(1);
  });

  it("is symmetric around 0.5", () => {
    expect(noulCertainty(0.9)).toBeCloseTo(noulCertainty(0.1));
  });
});

describe("certaintyOf", () => {
  it("derives certainty for noul, which has no confidence field", () => {
    expect(certaintyOf({ type: "noul", noul: 0.95 })).toBeCloseTo(0.9);
  });

  it("uses the reported confidence for choice", () => {
    expect(
      certaintyOf({
        type: "choice",
        choice: "billing",
        probabilities: { billing: 0.88, technical: 0.12 },
        confidence: 0.81,
      }),
    ).toBe(0.81);
  });
});

describe("judge bypass behaviour", () => {
  it("bypasses rather than throwing when the key is absent", async () => {
    delete process.env.TYPESAFE_API_KEY;
    const result = await judge({ state: "x", questions: choiceQuestion });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("no_api_key");
  });

  it("bypasses on timeout instead of hanging", async () => {
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const result = await judge({ state: "x", questions: choiceQuestion, timeoutMs: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("timeout");
  });

  it("bypasses on a non-2xx response", async () => {
    vi.stubGlobal("fetch", async () =>
      new Response("rate limited", { status: 429, statusText: "Too Many Requests" }),
    );

    const result = await judge({ state: "x", questions: choiceQuestion });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("http_error");
      expect(result.detail).toContain("429");
    }
  });

  it("bypasses on a network error", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new Error("ECONNREFUSED");
    });

    const result = await judge({ state: "x", questions: choiceQuestion });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("network_error");
  });

  it("bypasses when the response carries no answers", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ model: "jev-1.13.0" }));

    const result = await judge({ state: "x", questions: choiceQuestion });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("bad_response");
  });
});

describe("judge success", () => {
  it("returns answers and usage, and sends the key as a bearer token", async () => {
    let captured: RequestInit | undefined;
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      captured = init;
      return Response.json({
        model: "jev-1.13.0",
        answers: {
          q: {
            type: "choice",
            choice: "billing",
            probabilities: { billing: 0.88, technical: 0.12 },
            confidence: 0.81,
          },
        },
        usage: { input_tokens: 296, output_tokens: 20 },
      });
    });

    const result = await judge({ state: { ticket: "refund me" }, questions: choiceQuestion });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.answers.q.type).toBe("choice");
      expect(result.usage.input_tokens).toBe(296);
      expect(result.model).toBe("jev-1.13.0");
    }

    const headers = captured?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key");

    const body = JSON.parse(String(captured?.body));
    expect(body.model).toBe("jev-latest");
    expect(body.state).toEqual({ ticket: "refund me" });
  });
});
