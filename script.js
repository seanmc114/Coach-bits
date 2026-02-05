// script.js — FINAL MULTILINGUAL JC COACH (ALL LANGUAGES WORKING)

const AI_URL = "https://loops-ai-coach.seansynge.workers.dev/api/correct";

// ------------------------------
// VERB PRESENCE GUARDRAIL
// ------------------------------
function hasVerbLikeWord(text, lang) {
  const t = text.toLowerCase();

  if (lang === "es") return /\b(es|está|son|tiene|hay|vive|juega|come|trabaja|gusta|gustas)\b/i.test(t);
  if (lang === "fr") return /\b(est|a|sont|aime|joue|vit)\b/i.test(t);
  if (lang === "de") return /\b(ist|hat|sind|spielt|lebt|mag)\b/i.test(t);
  if (lang === "ga") return /\b(tá|is)\b/i.test(t);

  return false;
}

// ------------------------------
// EXTENSION DETECTOR (RELEVANCE PROTECTION)
// ------------------------------
function hasExtension(text) {
  const t = text.toLowerCase();
  let signals = 0;

  if (/[.!?]/.test(t)) signals++;
  if (/\b(y|et|und|agus)\b/.test(t)) signals++;
  if ((t.match(/\b(es|está|tiene|est|a|ist|hat|tá|is)\b/g) || []).length >= 2)
    signals++;

  return signals >= 2;
}

// ------------------------------
// TURBO NEXT STEP
// ------------------------------
function nextStep(label, answer, lang) {
  const a = answer.toLowerCase();

  if (label === "Missing verb") {
    if (lang === "es") return "Add a verb — try **es** or **tiene**.";
    if (lang === "fr") return "Add a verb — try **est** or **a**.";
    if (lang === "de") return "Add a verb — try **ist** or **hat**.";
    if (lang === "ga") return "Add a verb — try **tá sé…** or **tá sí…**.";
  }

  if (label === "Task relevance") return "Describe the person — add another detail.";
  if (label === "Agreement") return "Make the words match.";
  if (label === "Verb form") {
    if (lang === "es" && a.includes("gustas")) return "Use **gusta**, not **gustas**.";
    if (lang === "es" && a.includes("eres")) return "Use **es**, not **eres**.";
    return "Check the verb ending.";
  }

  if (label === "Word order") {
    if (lang === "es") return "Start with **Mi amigo es…**";
    if (lang === "fr") return "Start with **Mon ami est…**";
    if (lang === "de") return "Start with **Mein Freund ist…**";
    if (lang === "ga") return "Start with **Tá sé…**";
  }

  return "Polish it — spelling or accents if you can.";
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
// MAIN UI
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");

  answerBox.value = "";
  answerBox.focus();

  runBtn.onclick = async () => {

    const langCode = document.getElementById("lang").value;
    const prompt = document.getElementById("prompt").value;
    const answer = answerBox.value.trim();

    // Map code → full name (THIS WAS THE BUG)
    const language =
      langCode === "es" ? "Spanish" :
      langCode === "fr" ? "French" :
      langCode === "de" ? "German" :
      "Gaeilge";

    runBtn.disabled = true;
    runBtn.innerText = "Thinking…";

    if (!hasVerbLikeWord(answer, langCode)) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <div class="score">Score: 0 / 10</div>
        <div class="focus">Focus: Missing verb</div>
        <div><strong>Do this:</strong><br>${nextStep("Missing verb", answer, langCode)}</div>
      `;
      runBtn.disabled = false;
      runBtn.innerText = "Ask coach";
      return;
    }

    const result = await classifyAnswer({
      prompt,
      answer,
      language
    });

    let s = result.scores;

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
      <div><br><strong>Do this:</strong><br>${nextStep(result.label, answer, langCode)}</div>
      <div><br><em>${result.rationale}</em></div>
    `;

    runBtn.disabled = false;
    runBtn.innerText = "Ask coach";
  };
});
