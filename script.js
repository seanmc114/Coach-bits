// script.js — TURBO COACH (JS-SAFE, CLASSROOM STABLE)

// ==============================
// CONFIG
// ==============================
const USE_AI_MIRROR = false;

// ==============================
// VERB ATTEMPT DETECTION
// ==============================
function hasVerb(text, lang) {
  const t = text.toLowerCase();

  if (lang === "es")
    return /\b(es|está|eres|soy|somos|tiene|tengo|vive|vives|vivo|gusta|gustas)\b/.test(t);

  if (lang === "fr")
    return /\b(est|suis|es|a|as|habite|habites|aime|aimes)\b/.test(t);

  if (lang === "de")
    return /\b(ist|bin|bist|hat|habe|hast|wohnt|wohnst|mag|magst)\b/.test(t);

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
  if (text.trim().split(/\s+/).length >= 6) s++;
  return s >= 2;
}

// ==============================
// LOCAL COACH (ALWAYS COACHES)
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
      focus: "Verb form / development",
      msg:
        "Good attempt — fix the verb form and add ONE more detail."
    };
  }

  return {
    score: 7,
    focus: "Accuracy",
    msg:
      "Solid answer. Push it — add an opinion or a reason."
  };
}

// ==============================
// UI
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = () => {
    const lang = document.getElementById("lang").value;
    const answer = answerBox.value.trim();

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    const result = localCoach(answer, lang);

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${result.score} / 10</div>
      <div class="focus">Focus: ${result.focus}</div>
      <div><strong>Do this:</strong> ${result.msg}</div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
