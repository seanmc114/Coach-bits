// script.js — FINAL JC COACH (TRUSTED TURBO BUILD)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// MINIMAL HUMAN GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text) {
  return /\b(es|está|son|soy|eres|tiene|tengo|hay|va|vive|juega|come|trabaja|gusta|gustas)\b/i
    .test(text);
}

// ------------------------------
// SAFE, EARNED TURBO HINTS
// ------------------------------
function nextStep(label, answer) {
  const a = answer.toLowerCase();

  if (label === "Missing verb") {
    return "Add a verb — try **es** (he is) or **tiene** (he has).";
  }

  if (label === "Task relevance") {
    return "Describe the person — try **es + adjective**.";
  }

  if (label === "Agreement") {
    return "Match the adjective — **alto → alta**, **simpático → simpática**.";
  }

  if (label === "Verb form") {
    // Only be specific if the verb is actually there
    if (a.includes("gustas")) {
      return "Use **gusta** (he likes), not **gustas**.";
    }
    if (a.includes("eres")) {
      return "Use **es** (he is), not **eres** (you are).";
    }
    return "Check the verb ending — is it **he/she** or **you**?";
  }

  if (label === "Word order") {
    return "Start with **Mi amigo es…**";
  }

  // Accuracy (polish only)
  return "Polish it — add accents if you can (e.g. **simpatico → simpático**).";
}

// ------------------------------
// AI CLASSIFIER
// ------------------------------
async function classifyAnswer(payload) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    payload.instructions = `
You are a Junior Cycle language examiner.

Name these explicitly if dominant:
• Agreement
• Verb form
• Word order

Otherwise use:
• Task relevance
• Accuracy

Choose ONE focus only.
Be decisive.
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
    return {
      verdict: "amber",
      scores: { structure: 2, relevance: 1, accuracy: 1 },
      label: "Task relevance",
      rationale: "The sentence does not clearly describe the person."
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
  const answerBox = document.getElementById("answer");

  // Turbo start: cursor ready
  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = async () => {

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    const prompt = document.getElementById("prompt").value;
    const answer = answerBox.value.trim();

    // 🔴 HARD STOP: NO VERB
    if (!hasVerbLikeWord(answer)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="focus">Focus: Missing verb</div>
        <div><strong>Do this:</strong><br>${nextStep("Missing verb", answer)}</div>
      `;
      runBtn.disabled = false;
      runBtn.innerText = "Ask coach";
      return;
    }

    const result = await classifyAnswer({ prompt, answer });

    let s = result.scores;
    let total = s.structure + s.relevance + s.accuracy;

    // 🔒 LOW-BAND CAP
    if (s.relevance <= 1 && s.structure <= 2) {
      total = Math.min(total, 4);
    }

    const hint = nextStep(result.label, answer);

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${total} / 10</div>
      <div class="focus">Focus: ${result.label}</div>
      <div>${coachSpeak(total, result.label)}</div>
      <div><br><strong>Do this:</strong><br>${hint}</div>
      <div><br><em>${result.rationale}</em></div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
