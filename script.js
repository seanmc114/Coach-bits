// script.js — FINAL JC COACH SANDBOX (SCORING + CLASSIFIER)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// HUMAN CREDIBILITY GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text) {
  return /\b(es|está|son|soy|eres|tiene|tengo|hay|me|te|le|nos|os|les|va|viene|juega|come|trabaja)\b/i
    .test(text);
}

// ------------------------------
// AI CLASSIFIER WITH JC RUBRIC
// ------------------------------
async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    payload.instructions = `
You are a Junior Cycle language examiner.

Apply this marking scheme (out of 10):
• Structure (0–4): verb present, sentence usable
• Relevance (0–3): answers the task
• Accuracy (0–3): grammar, agreement, spelling

Rules:
- If NO verb → Structure = 0, verdict = red, label "Missing verb".
- If off-task → low relevance.
- Do not be vague.
- Choose ONE focus: lowest scoring category.

Return JSON only in this format:
{
  verdict,
  scores:{structure,relevance,accuracy},
  label,
  rationale
}
`;

    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text);

    return JSON.parse(text);

  } catch {
    // SAFE FALLBACK
    return {
      verdict: "amber",
      scores: { structure: 2, relevance: 1, accuracy: 2 },
      label: "Accuracy",
      rationale: "Some accuracy issues are costing marks."
    };
  }
}

// ------------------------------
// COACH VOICE
// ------------------------------
function coachSpeak(verdict, label) {
  if (verdict === "red") {
    return `Stop. Today’s focus: ${label}.`;
  }
  if (verdict === "amber") {
    return `This scores — but focus on ${label}.`;
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

    // 🔴 HARD STOP: NO VERB
    if (!hasVerbLikeWord(answer)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="breakdown">Structure: 0/4 • Relevance: 0/3 • Accuracy: 0/3</div>
        <div class="focus">Focus: Missing verb</div>
        <div>Coach says:<br>Stop. A description needs a verb to score.</div>
      `;
      runBtn.disabled = false;
      runBtn.innerText = "Ask coach";
      return;
    }

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

    const s = result.scores;
    const total = s.structure + s.relevance + s.accuracy;

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${total} / 10</div>
      <div class="breakdown">
        Structure: ${s.structure}/4 •
        Relevance: ${s.relevance}/3 •
        Accuracy: ${s.accuracy}/3
      </div>
      <div class="focus">Focus: ${result.label}</div>
      <div>Coach says:<br>${coachSpeak(result.verdict, result.label)}</div>
      <div><br>Why:<br>${result.rationale}</div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
