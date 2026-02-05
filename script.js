// script.js — LOCAL JC COACH (NO AI, CLASSROOM SAFE)

function hasVerb(text, lang) {
  const t = text.toLowerCase();
  if (lang === "es") return /\b(es|está|tiene|vive|gusta)\b/.test(t);
  if (lang === "fr") return /\b(est|a|habite|aime)\b/.test(t);
  if (lang === "de") return /\b(ist|hat|wohnt|mag)\b/.test(t);
  if (lang === "ga") return /\b(tá|is)\b/.test(t);
  return false;
}

function hasExtension(text) {
  let score = 0;
  if (/\b(y|et|und|agus)\b/i.test(text)) score++;
  if (/[.!?]/.test(text)) score++;
  if ((text.match(/\b(es|est|ist|tá|tiene|a|hat)\b/gi) || []).length >= 2)
    score++;
  return score >= 2;
}

function coachResult(answer, lang) {
  if (!hasVerb(answer, lang)) {
    return {
      score: 0,
      focus: "Missing verb",
      message:
        lang === "es" ? "Add a verb — try **es** or **tiene**." :
        lang === "fr" ? "Add a verb — try **est** or **a**." :
        lang === "de" ? "Add a verb — try **ist** or **hat**." :
        "Add a verb — try **tá sé…** or **tá sí…**."
    };
  }

  let score = 4;
  let focus = "Task relevance";
  let message = "Add another detail about the person.";

  if (hasExtension(answer)) {
    score = 7;
    focus = "Accuracy";
    message = "Good structure — polish spelling or accents if you can.";
  }

  return { score, focus, message };
}

document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = () => {
    const lang = document.getElementById("lang").value;
    const answer = answerBox.value.trim();

    const result = coachResult(answer, lang);

    out.classList.remove("hidden");
    out.innerHTML = `
      <div class="score">Score: ${result.score} / 10</div>
      <div class="focus">Focus: ${result.focus}</div>
      <div><strong>Do this:</strong> ${result.message}</div>
    `;
  };
});
