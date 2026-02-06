// script.js — TURBO COACH vCALIBRATED (ALL LANGUAGES)

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
// BASIC STRUCTURE
// ==============================
function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

function hasConnector(text) {
  return /\b(y|et|und|agus|pero|mais|aber|porque|parce que|weil)\b/i.test(text);
}

function hasOpinion(text, lang) {
  const t = text.toLowerCase();

  if (lang === "es") return /\b(creo que|pienso que|me parece que|porque)\b/.test(t);
  if (lang === "fr") return /\b(je pense que|à mon avis|parce que)\b/.test(t);
  if (lang === "de") return /\b(ich denke|meiner meinung nach|weil)\b/.test(t);
  if (lang === "ga") return /\b(sílim go|dar liom|mar go)\b/.test(t);

  return false;
}

// ==============================
// LOCAL COACH
// ==============================
function localCoach(answer, lang) {

  const words = wordCount(answer);

  // --- No verb attempt ---
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

  // --- Fragment / single idea ---
  if (words <= 3) {
    return {
      score: 2,
      focus: "Fragment",
      msg: "That’s a start — write a full sentence about the person."
    };
  }

  // --- Sentence but thin / unclear ---
  if (!hasConnector(answer) && !hasOpinion(answer, lang)) {
    return {
      score: 5,
      focus: "Development / word choice",
      msg:
        lang === "es"
          ? "Add a clearer detail — e.g. **es alto**, **es simpático**, or explain it."
          : lang === "fr"
          ? "Add a clearer detail — e.g. **il est grand**, **il est sympa**."
          : lang === "de"
          ? "Add a clearer detail — e.g. **er ist groß**, **er ist nett**."
          : "Add a clearer detail — describe appearance or personality."
    };
  }

  // --- Developed, but no opinion/reason ---
  if (!hasOpinion(answer, lang)) {
    return {
      score: 7,
      focus: "Development",
      msg:
        lang === "es"
          ? "Good answer. Add an opinion — start with **Creo que…** or a reason with **porque…**."
          : lang === "fr"
          ? "Good answer. Add an opinion — start with **Je pense que…** or **parce que…**."
          : lang === "de"
          ? "Good answer. Add an opinion — start with **Ich denke, dass…** or **weil…**."
          : "Good answer. Add an opinion — start with **Sílim go…**."
    };
  }

  // --- Opinion / reason present (top band teaser) ---
  return {
    score: 8,
    focus: "Quality",
    msg:
      "Very good. Check accuracy and add one more specific detail to push it further."
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
