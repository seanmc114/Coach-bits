// ai.js — SAFE EXAM CLASSIFIER WRAPPER

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

export async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000); // hard timeout

    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text);

    const json = JSON.parse(text);

    // sanity check
    if (!json || !["green", "amber", "red"].includes(json.verdict)) {
      throw new Error("Invalid classifier response");
    }

    return json;

  } catch (err) {
    // HARD SAFE FALLBACK — NEVER BREAK GAME FLOW
    return {
      verdict: "amber",
      error_code: "accuracy",
      label: "Accuracy",
      rationale: "Some accuracy issues are costing marks.",
      confidence: 0
    };
  }
}

