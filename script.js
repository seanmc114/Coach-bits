// script.js — FINAL JC COACH (TURBO HINTS)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// MINIMAL HUMAN GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text) {
  return /\b(es|está|son|soy|eres|tiene|tengo|hay|va|vive|juega|come|trabaja)\b/i
    .test(text);
}

// ------------------------------
// TURBO NEXT-STEP PLAYBOOK (SPANISH)
// ------------------------------
const NEXT_STEP = {
  "Missing verb": "Add a verb — try **es** (he is) or **tiene** (he has).",
  "Task relevance": "Describe the person — try **es + adjective**.",
  "Agreement": "Match the adjective — **alto → alta**, **simpático → simpática**.",
  "Verb form": "Use **es** (he is), not **eres** (you are).",
  "Word order": "Start with **Mi amigo es…**",
  "Accuracy": "Polish it — add accents (e.g. **simpatico → simpático**)."
};

// ------------------------------
// AI CLASSIFIER WITH JC RUBRIC
// ------------------------------
async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    payload.instructions = `
You are a Junior Cycle language examiner.

Apply this marking scheme (total 10 marks).

Name agreement, verb form, or word order explicitly if they are the main issue.
Choose ONE focus only.
Be decisive.
Return JSON only.
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
    return {
      verdict: "amber",
      scores: { structure: 2, relevance: 1, accuracy: 1 },
      label: "Task relevance",
      rationale: "The sentence does not really describe the person."
    };
  }
}

// ------------------------------
// COACH VOICE
// ------------------------------
function coachSpeak(verdict, label) {
  if (verdict === "red") return `Stop. Today’s focus: ${label}.`;
  if (verdict === "amber") return `This scores — but focus on ${label}.`;
  return "Good. That scores. Push it to the top band.";
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

    if (!hasVerbLikeWord(answer)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="focus">Focus: Missing verb</div>
        <div><strong>Try this next:</strong><br>${NEXT_STEP["Missing verb"]}</div>
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

    let s = result.scores;
    let total = s.structure + s.relevance + s.accuracy;

    if (s.relevance <= 1 && s.structure <= 2) {
      total = Math.min(total, 4);
    }

    const next = NEXT_STEP[result.label] || NEXT_STEP["Accuracy"];

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${total} / 10</div>
      <div class="focus">Focus: ${result.label}</div>
      <div>${coachSpeak(result.verdict, result.label)}</div>
      <div><br><strong>Try this next:</strong><br>${next}</div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
