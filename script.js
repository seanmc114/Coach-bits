// script.js — TURBO COACH (LOCAL + AI MIRROR READY)

// ==============================
// CONFIG
// ==============================
const USE_AI_MIRROR = false; // true = AI mirror at top band
const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ==============================
// VERB DETECTION (ATTEMPT LEVEL)
// ==============================
function hasVerb(text, lang) {
  const t = text.toLowerCase();

  if (lang === "es")
    return /\b(es|está|eres|soy|somos|tiene|tengo|vive|vivo|gusta|gustas)\b/.test(t);

  if (lang === "fr")
    return /\b(est|suis|es|a|as|habite|aime|aimes)\b/.test(t);

  if (lang === "de")
    return /\b(ist|bin|bist|hat|habe|hast|wohnt|mag|magst)\b/.test(t);

  if (lang === "ga")
    return /\b(tá|is|táim|táimid)\b/.test(t);

  return false;
}

// ==============================
// EXTENSION DETECTOR
// ==============================
function hasExtension(text) {
  let s = 0;
  if (/\b(y|et|und|agus)\b/i.test(text)) s++;
  if (/[.!?]/.test(text)) s++;
  if ((text.match(/\b(es|est|ist|tá|tiene|a|hat)\b/gi) || []).length >= 2) s++;
  return s >= 2;
}

// ==============================
// LOCAL COACH (ALWAYS GIVES TURBO)
// ==============================
function localCoach(answer, lang) {

  if (!hasVerb(answer, lang)) {
    return {
      score: 0,
      focus: "Missing verb",
      msg:
        lang === "es" ? "Add a verb — try **es** or **tiene**." :
        lang === "fr" ? "Add a verb — try **est** or **a**." :
        lang === "de" ? "Add a verb — try **ist** or **hat**." :
        "Add a verb — try **tá sé…**."
    };
  }

  if (!hasExtension(answer)) {
    return {
      score: 5,
      focus: "Development",
      msg:
        "Good start — add ONE more detail (appearance, personality, or interest)."
    };
  }

  return {
    score: 7,
    focus: "Accuracy",
    msg:
      "Solid answer. Now push it — add an opinion or a reason."
  };
}

// ==============================
// AI MIRROR (TOP BAND ONLY)
// ==============================
async function aiMirror(prompt, answer, lang) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language: lang,
        task: "Junior Cycle description",
        prompt,
        answer,
        instruction:
          "Give ONE concrete suggestion to improve this already-good answer. No grammar lecture."
      })
    });

    const data = await res.json();
    return data.tip || null;
  } catch {
    return null;
  }
}

// ==============================
// UI
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");
  const promptBox = document.getElementById("prompt");
  const langBox = document.getElementById("lang");

  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = async () => {

    const lang = langBox.value;
    const answer = answerBox.value.trim();
    const prompt = promptBox.value;

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    const local = localCoach(answer, lang);
    let extra = "";

    if (USE_AI_MIRROR && local.score >= 7) {
      const tip = await aiMirror(prompt, answer, lang);
      if (tip) extra = `<br><strong>Coach adds:</strong> ${tip}`;
    }

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${local.score} / 10</div>
      <div class="focus">Focus: ${local.focus}</div>
      <div><strong>Do this:</strong> ${local.msg}${extra}</div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
