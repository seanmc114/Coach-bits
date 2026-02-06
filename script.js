// script.js — TURBO COACH vSTABLE (ALL LANGUAGES FIXED)

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
// BASIC STRUCTURE CHECKS
// ==============================
function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

function hasExtension(text) {
  let s = 0;
  if (/\b(y|et|und|agus)\b/i.test(text)) s++;
  if (/[.!?]/.test(text)) s++;
  if (wordCount(text) >= 7) s++;
  return s >= 2;
}

// ==============================
// LOCAL COACH
// ==============================
function localCoach(answer, lang) {

  const words = wordCount(answer);

  // --- No verb at all ---
  if (!hasVerb(answer, lang)) {
    return {
      score: 0,
      focus: "Missing verb",
      msg:
        lang === "es" ? "Add a verb — start with **es** or **tiene**." :
        lang === "fr" ? "Add a verb — start with **est** or **a**." :
        lang === "de" ? "Add a verb — start with **ist** or **hat**." :
        "Add a verb — start with **tá sé…**."
    };
  }

  // --- Single word or fragment ---
  if (words <= 2) {
    return {
      score: 2,
      focus: "Fragment",
      msg: "That’s a start — now write a full sentence."
    };
  }

  // --- Sentence but thin / verb form issues ---
  if (!hasExtension(answer)) {

    let fix = "Fix the verb form and add ONE more detail.";

    if (lang === "es") {
      if (/\beres\b/i.test(answer)) fix = "Use **es** (he/she is), not **eres**.";
      else if (/\bvives\b/i.test(answer)) fix = "Use **vive** (he lives), not **vives**.";
      else if (/\bgustas\b/i.test(answer)) fix = "Use **le gusta**, not **gustas**.";
    }

    return {
      score: 5,
      focus: "Verb form / development",
      msg: fix
    };
  }

  // --- Developed but not top band ---
  return {
    score: 7,
    focus: "Accuracy",
    msg:
      lang === "es"
        ? "Good answer. Add an opinion — start with **Creo que…** or a reason with **porque…**."
        : lang === "fr"
        ? "Good answer. Add an opinion — start with **Je pense que…** or a reason with **parce que…**."
        : lang === "de"
        ? "Good answer. Add an opinion — start with **Ich denke, dass…** or a reason with **weil…**."
        : "Good answer. Add an opinion — start with **Sílim go…**."
  };
}

// ==============================
// UI LOGIC
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  function reset() {
    answerBox.value = "";
    answerBox.disabled = false;
    answerBox.focus();
    runBtn.innerText = "Ask coach";
  }

  reset();

  runBtn.onclick = () => {
    const lang = document.getElementById("lang").value;
    const answer = answerBox.value.trim();

    runBtn.innerText = "Checking…";
    answerBox.disabled = true;

    const result = localCoach(answer, lang);

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${result.score} / 10</div>
      <div class="focus">Focus: ${result.focus}</div>
      <div><strong>Do this:</strong> ${result.msg}</div>
      <button id="retryBtn" style="margin-top:12px;">Try again</button>
    `;

    document.getElementById("retryBtn").onclick = () => {
      reset();
      out.classList.add("hidden");
    };
  };
});
