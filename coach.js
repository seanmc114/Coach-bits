/* coach.js
   Isolated language coach
   No DOM. No API. Always returns something.
*/

const Coach = (() => {

  function analyse({ prompt, answer, lang }) {
    const a = (answer || "").trim();
    const p = (prompt || "").toLowerCase();

    // default result (never empty)
    const result = {
      focusTag: "detail",
      focusLabel: "Add one more detail",
      severity: 1,
      message: "",
      passed: true
    };

    if (!a) {
      result.focusTag = "blank";
      result.focusLabel = "Write something";
      result.severity = 5;
      result.passed = false;
      result.message = "No answer given.";
      return result;
    }

    const wc = a.split(/\s+/).length;

    // language-agnostic short answer
    if (wc < 3) {
      result.focusTag = "too_short";
      result.focusLabel = "Too short";
      result.severity = 3;
      result.passed = false;
      result.message = "Too short to score well.";
      return result;
    }

    // Spanish-specific checks (kept deliberately minimal)
    if (lang === "es") {
      // --- Missing verb (very common beginner error) ---
const hasVerb =
  /\b(es|está|son|soy|eres|tiene|tengo|hay|me gusta|vive|juega|come|va)\b/i
    .test(a);

if (!hasVerb) {
  result.focusTag = "missing_verb";
  result.focusLabel = "Missing verb";
  result.severity = 5;
  result.passed = false;
  result.message = "You need a verb to score (es / tiene / hay / me gusta…).";
  return result;
}
 
      if (p.includes("friend") && /\b(eres|tienes|estás)\b/i.test(a)) {
        result.focusTag = "person";
        result.focusLabel = "Wrong person (eres → es)";
        result.severity = 4;
        result.passed = false;
        result.message = "Prompt is about him/her, not you.";
        return result;
      }

      if (/\byo\s+es\b/i.test(a)) {
        result.focusTag = "verb";
        result.focusLabel = "Verb form";
        result.severity = 4;
        result.passed = false;
        result.message = "yo es → yo soy";
        return result;
      }

      if (/[aeiou]$/i.test(a) && !/[.!?]$/.test(a)) {
        result.focusTag = "polish";
        result.focusLabel = "Polish";
        result.severity = 1;
        result.message = "Sentence is fine — just polish it.";
        return result;
      }
    }

    // otherwise: acceptable
    result.message = "This would score. One more detail would improve it.";
    return result;
  }

  function coachSpeak(r) {
    if (!r.passed) {
      return `Standards. Today’s focus: ${r.focusLabel}.`;
    }
    return `Good. That scores. Next time, add one detail.`;
  }

  return {
    analyse,
    coachSpeak
  };
})();

