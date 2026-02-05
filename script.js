// script.js — FULL SANDBOX VERSION (NO CODING REQUIRED)

// ------------------------------
// AI CLASSIFIER (SAFE)
// ------------------------------
const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text);

    const json = JSON.parse(text);

    if (!json || !["green", "amber", "red"].includes(json.verdict)) {
      throw new Error("Bad AI response");
    }

    return json;

  } catch (e) {
    // SAFE FALLBACK — NEVER BREAK
    return {
      verdict: "amber",
      error_code: "accuracy",
      label: "Accuracy",
      rationale: "Some accuracy issues are costing marks.",
      confidence: 0
    };
  }
}

// ------------------------------
// COACH SPEECH
// ------------------------------
function coachSpeak(result) {
  if (result.verdict === "red") {
    return `Stop. Today’s focus: ${result.label}.`;
  }
  if (result.verdict === "amber") {
    return `This scores — but focus on ${result.label}.`;
  }
  return "Good. That scores. Add one more detail.";
}

// ------------------------------
// BUTTON WIRING
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");

  runBtn.onclick = async () => {

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    const prompt = document.getElementById("prompt").value;
    const answer = document.getElementById("answer").value;
    const langCode = document.getElementById("lang").value;

    const language =
      langCode === "es" ? "Spanish" :
      langCode === "fr" ? "French" : "German";

    const result = await classifyAnswer({
      mode: "classifier",
      language,
      level: "Junior Cycle",
      task: "short description",
      prompt,
      answer
    });

    out.classList.remove("hidden");
    out.innerText =
      "Coach says:\n\n" +
      coachSpeak(result) +
      "\n\nReason:\n" +
      result.rationale;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
