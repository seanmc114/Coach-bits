// script.js — MULTILINGUAL JC COACH (HANG-PROOF)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// VERB PRESENCE GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text, lang) {
  const t = text.toLowerCase();
  if (lang === "es") return /\b(es|está|tiene|gusta)\b/.test(t);
  if (lang === "fr") return /\b(est|a|aime)\b/.test(t);
  if (lang === "de") return /\b(ist|hat|mag)\b/.test(t);
  if (lang === "ga") return /\b(tá|is)\b/.test(t);
  return false;
}

// ------------------------------
// EXTENSION DETECTOR
// ------------------------------
function hasExtension(text) {
  let signals = 0;
  if (/[.!?]/.test(text)) signals++;
  if (/\b(y|et|und|agus)\b/i.test(text)) signals++;
  if ((text.match(/\b(es|est|ist|tá|tiene|a|hat)\b/gi) || []).length >= 2) signals++;
  return signals >= 2;
}

// ------------------------------
// TURBO NEXT STEP
// ------------------------------
function nextStep(label, lang) {
  if (label === "Missing verb") {
    if (lang === "es") return "Add a verb — try **es** or **tiene**.";
    if (lang === "fr") return "Add a verb — try **est** or **a**.";
    if (lang === "de") return "Add a verb — try **ist** or **hat**.";
    if (lang === "ga") return "Add a verb — try **tá sé…**.";
  }
  if (label === "Agreement") return "Make the words match.";
  if (label === "Verb form") return "Check the verb ending.";
  if (label === "Word order") return "Start with the subject.";
  return "Add another detail.";
}

// ------------------------------
// AI CALL WITH TIMEOUT
// ------------------------------
async function classifyAnswer(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return await res.json();
  } catch {
    clearTimeout(timeout);
    // SAFE FALLBACK — NEVER HANG
    return {
      scores: { structure: 3, relevance: 2, accuracy: 2 },
      label: "Accuracy",
      rationale: "Some accuracy issues."
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
// MAIN UI
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
        <div><strong>Do this:</strong><br>${nextStep("Missing verb", lang)}</div>
      `;
      runBtn.disabled = false;
      runBtn.innerText = "Ask coach";
      return;
    }

    const result = await classifyAnswer({ prompt, answer, language: lang });

    let s = result.scores;
    if (hasExtension(answer)) s.relevance = Math.max(s.relevance, 2);

    let total = s.structure + s.relevance + s.accuracy;
    if (s.relevance <= 1 && s.structure <= 2) total = Math.min(total, 4);

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${total} / 10</div>
      <div class="focus">Focus: ${result.label}</div>
      <div>${coachSpeak(total, result.label)}</div>
      <div><br><strong>Do this:</strong><br>${nextStep(result.label, lang)}</div>
      <div><br><em>${result.rationale}</em></div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
