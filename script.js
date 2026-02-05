// script.js — FINAL JC COACH (CREDIBLE TURBO VERSION)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// MINIMAL HUMAN GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text) {
  return /\b(es|está|son|soy|eres|tiene|tengo|hay|va|vive|juega|come|trabaja|gusta)\b/i
    .test(text);
}

// ------------------------------
// TURBO NEXT-STEP PLAYBOOK
// ------------------------------
const NEXT_STEP = {
  "Missing verb": "Add a verb — try **es** (he is) or **tiene** (he has).",
  "Task relevance": "Describe the person — try **es + adjective**.",
  "Agreement": "Match the adjective — **alto → alta**, **simpático → simpática**.",
  "Verb form": "Check the verb — use **gusta** (he likes), not **gustas**.",
  "Word order": "Start with **Mi amigo es…**",
  "Accuracy": "Now polish — add accents if you can."
};

// ------------------------------
// AI CLASSIFIER
// ------------------------------
async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    payload.instructions = `
You are a Junior Cycle language examiner.
If the main issue is verb form (person/ending), label it "Verb form".
If agreement is the issue, label it "Agreement".
Choose ONE dominant focus.
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
      label: "Verb form",
      rationale: "Incorrect verb form."
    };
  }
}

// ------------------------------
// COACH VOICE (SCORE-AWARE)
// ------------------------------
function coachSpeak(total, label) {
  if (total <= 3) {
    return `Stop. Fix the ${label} and go again.`;
  }
  if (total <= 6) {
    return `This scores, but the ${label} is holding it back.`;
  }
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

    const result = await classifyAnswer({ prompt, answer });

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
      <div>${coachSpeak(total, result.label)}</div>
      <div><br><strong>Do this:</strong><br>${next}</div>
      <div><br><em>${result.rationale}</em></div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
