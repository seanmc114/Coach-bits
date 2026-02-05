/* coach.js
   Isolated language coach — JC STRICT STRUCTURE VERSION
*/

const Coach = (() => {

  function analyse({ prompt, answer, lang }) {
    const a = (answer || "").trim();
    const p = (prompt || "").toLowerCase();

    const result = {
      focusTag: "detail",
      focusLabel: "Add one more detail",
      severity: 1,
      message: "",
      passed: true
    };

    // --- No answer ---
    if (!a) {
      result.focusTag = "blank";
      result.focusLabel = "Write something";
      result.severity = 5;
      result.passed = false;
      result.message = "No answer given.";
      return result;
    }

    const wc = a.split(/\s+/).length;

    // --- Too short ---
    if (wc < 3) {
      result.focusTag = "too_short";
      result.focusLabel = "Too short";
      result.severity = 4;
      result.passed = false;
      result.message = "Too short to score — add a verb.";
      return result;
    }

    // ==============================
    // Spanish-specific checks
    // ==============================
    if (lang === "es") {

      // 🔴 HARD STOP: broken GUSTAR frame (must come FIRST)
      if (/\b(gusta|gustan)\b/i.test(a) && !/\b(me|te|le|nos|os|les)\b/i.test(a)) {
        result.focusTag = "verb_frame";
        result.focusLabel = "Broken verb frame";
        result.severity = 5;
        result.passed = false;
        result.message = "With gusta / gustan you MUST use me / le / nos (me gustan…).";
        return result;
      }

      // --- Missing verb (noun/adjective phrases) ---
      const hasVerb =
        /\b(es|está|son|soy|eres|tiene|tengo|hay|vive|juega|come|va)\b/i
          .test(a);

      const hasAdjective =
        /\b(alto|alta|altos|altas|simpatico|simpática|simpaticos|simpáticas|grande|pequeño|pequeña|bonito|bonita|divertido|divertida)\b/i
          .test(a);

      if (hasAdjective && !hasVerb) {
        result.focusTag = "missing_verb";
        result.focusLabel = "Missing verb";
        result.severity = 5;
        result.passed = false;
        result.message = "Descriptions need a verb (es / tiene / hay…).";
        return result;
      }

      // --- Wrong person (he/she vs you) ---
      if (p.includes("friend") && /\b(eres|tienes|estás)\b/i.test(a)) {
        result.focusTag = "person";
        result.focusLabel = "Wrong person (eres → es)";
        result.severity = 4;
        result.passed = false;
        result.message = "Prompt is about him/her, not you.";
        return result;
      }
    }

    // --- Acceptable answer ---
    result.message = "This would score. Add one more detail to improve it.";
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
