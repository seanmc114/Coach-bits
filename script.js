// script.js — FINAL JC COACH (RELEVANCE-SAFE)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// MINIMAL HUMAN GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text, lang) {
  const t = text.toLowerCase();
  if (lang === "es") return /\b(es|está|son|tiene|hay|vive|juega|come|trabaja|gusta)\b/i.test(t);
  if (lang === "fr") return /\b(est|a|sont|aime|joue|vit)\b/i.test(t);
  if (lang === "de") return /\b(ist|hat|sind|spielt|lebt|mag)\b/i.test(t);
  if (lang === "ga") return /\b(tá|is)\b/i.test(t);
  return false;
}

// ------------------------------
// EXTENSION DETECTOR (THE FIX)
// ------------------------------
function hasExtension(text) {
  const t = text.toLowerCase();
  let signals = 0;

  if (/[.!?]/.test(t)) signals++;                 // more than one sentence
  if (/\b(y|et|und|agus)\b/.test(t)) signals++;   // connector
  if ((t.match(/\b(es|está|tiene|est|a|ist|hat|tá)\b/g) || []).length >= 2)
    signals++; // more than one verb

  return signals >= 2;
}

// ------------------------------
// AI CLASSIFIER
// ------------------------------
async function classifyAnswer(payload) {
  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch {
    return {
      verdict: "amber",
      scores: { structure: 3, relevance: 2, accuracy: 2 },
      label: "Accuracy",
      rationale: "Minor accuracy issues."
    };
  }
}

// ------------------------------
// COACH VOICE
// ------------------------------
function coachSpeak(total, label) {
  if (total <= 3) return `Stop. Fix the ${label} and go again.`;
  if (total <= 6) return `This scores, but the ${label} is holding it back.`;
  return "Good. That scores. Push it to the top band.";
}

// ------------------------------
// BUTTON WIRING
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = async () => {

    const lang = document.getElementById("lang").value;
    const prompt = document.getElementById("prompt").value;
    const answer = answerBox.value.trim();

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    if (!hasVerbLikeWord(answer, lang)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="focus">Focus: Missing verb</div>
        <div>Add a verb and try again.</div>
      `;
      runBtn.disabled = false;
      runBtn.innerText = "Ask coach";
      return;
    }

    const result = await classifyAnswer({ prompt, answer, language: lang });

    let s = result.scores;

    // 🔒 RELEVANCE PROTECTION (THE IMPORTANT BIT)
    if (hasExtension(answer)) {
      s.relevance = Math.max(s.relevance, 2);
    }

    let total = s.structure + s.relevance + s.accuracy;

    if (s.relevance <= 1 && s.structure <= 2) {
      total = Math.min(total, 4);
    }

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${total} / 10</div>
      <div class="focus">Focus: ${result.label}</div>
      <div>${coachSpeak(total, result.label)}</div>
      <div><em>${result.rationale}</em></div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
