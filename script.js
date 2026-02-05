// script.js — FINAL JC COACH (WITH CAP + FOCUS + REPLAY NUDGE)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// MINIMAL HUMAN GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text) {
  return /\b(es|está|son|soy|eres|tiene|tengo|hay|va|vive|juega|come|trabaja)\b/i
    .test(text);
}

// ------------------------------
// COACH NEXT-STEP PLAYBOOK
// ------------------------------
const NEXT_STEP = {
  "Missing verb": "Add a verb — say what the person *is* or *has*.",
  "Task relevance": "Say something *about the person*, not yourself or activities.",
  "Agreement": "Check that adjectives match the noun (gender and number).",
  "Verb form": "Check the verb ending — who is doing the action?",
  "Word order": "Put the subject first, then the verb, then the detail.",
  "Accuracy": "Polish it — check spelling and accents."
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

Apply this marking scheme (total 10 marks):

STRUCTURE (0–4):
• 4: clear sentence, appropriate verb for task
• 3: verb present, sentence works but thin
• 2: verb present but weak or barely relevant
• 0–1: fragment or unusable

RELEVANCE (0–3):
• 3: answers the task with more than one idea OR a qualifier
• 2: answers the task briefly
• 1: partly on task
• 0: off task

ACCURACY (0–3):
• 3: accurate, including accents
• 2: minor issues (agreement or missing accents)
• 1: repeated errors but meaning clear
• 0: accuracy prevents meaning

Rules:
• One short correct sentence cannot score above 7/10.
• Missing accents prevent a perfect score.
• If agreement, verb form, or word order is the main issue, name it explicitly.
• Choose ONE focus: the lowest category or dominant accuracy issue.
• Be decisive, not vague.

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
      rationale: "The sentence does not really describe the person."
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

    // 🔴 HARD STOP: NO VERB
    if (!hasVerbLikeWord(answer)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="breakdown">Structure: 0/4 • Relevance: 0/3 • Accuracy: 0/3</div>
        <div class="focus">Focus: Missing verb</div>
        <div>Coach says:<br>Stop. A description needs a verb.</div>
        <div><br><strong>Try this next:</strong><br>${NEXT_STEP["Missing verb"]}</div>
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

    // 🔒 LOW-BAND CAP
    if (s.relevance <= 1 && s.structure <= 2) {
      total = Math.min(total, 4);
    }

    const next = NEXT_STEP[result.label] || NEXT_STEP["Accuracy"];

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
      <div><br><strong>Try this next:</strong><br>${next}</div>
      <div><br>Why:<br>${result.rationale}</div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
