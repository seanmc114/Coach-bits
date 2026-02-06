// script.js — LOCAL + AI MIRROR (A/B TEST READY)

const USE_AI_MIRROR = false; // ← toggle this
const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// BASIC LOCAL RULES (UNCHANGED)
// ------------------------------
function hasVerb(text, lang) {
  const t = text.toLowerCase();
  if (lang === "es") return /\b(es|está|tiene|vive|gusta)\b/.test(t);
  if (lang === "fr") return /\b(est|a|habite|aime)\b/.test(t);
  if (lang === "de") return /\b(ist|hat|wohnt|mag)\b/.test(t);
  if (lang === "ga") return /\b(tá|is)\b/.test(t);
  return false;
}

function hasExtension(text) {
  let s = 0;
  if (/\b(y|et|und|agus)\b/i.test(text)) s++;
  if (/[.!?]/.test(text)) s++;
  if ((text.match(/\b(es|est|ist|tá|tiene|a|hat)\b/gi) || []).length >= 2) s++;
  return s >= 2;
}

function localCoach(answer, lang) {
  if (!hasVerb(answer, lang)) {
    return { score: 0, focus: "Missing verb", msg: "Add a verb and try again." };
  }
  if (!hasExtension(answer)) {
    return { score: 5, focus: "Development", msg: "Good start — add one more detail." };
  }
  return { score: 7, focus: "Accuracy", msg: "Good structure — polish spelling or accents." };
}

// ------------------------------
// AI MIRROR (TOP BAND ONLY)
// ------------------------------
async function aiMirror(prompt, answer, lang) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        mode: "coach",
        language: lang,
        task: "Junior Cycle description",
        prompt,
        answer,
        instruction:
          "Give ONE specific suggestion to improve this already-good answer. No grammar lecture."
      })
    });
    const data = await res.json();
    return data.tip || null;
  } catch {
    return null; // silent fallback
  }
}

// ------------------------------
// UI
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  answerBox.focus();

  runBtn.onclick = async () => {
    const lang = document.getElementById("lang").value;
    const prompt = document.getElementById("prompt").value;
    const answer = answerBox.value.trim();

    runBtn.innerText = "Thinking…";
    runBtn.disabled = true;

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

    runBtn.innerText = "Ask coach";
    runBtn.disabled = false;
  };
});
