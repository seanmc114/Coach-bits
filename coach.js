/* coach.js
   Coaching-first language judge (JC)
   RED = block, AMBER = coach, GREEN = accept
*/

const Coach = (() => {

  function analyse({ prompt, answer, lang }) {
    const a = (answer || "").trim();
    const p = (prompt || "").toLowerCase();

    const result = {
      level: "green",          // green | amber | red
      focusTag: "detail",
      focusLabel: "Add one more detail",
      message: "",
      passed: true
    };

    // --------------------
    // Universal RED rules
    // --------------------
    if (!a) {
      return red("blank", "Write something", "No answer given.");
    }

    const wc = a.split(/\s+/).length;
    if (wc < 3) {
      return red("too_short", "Too short", "Too short to score — add a verb.");
    }

    // ====================
    // Spanish
    // ====================
    if (lang === "es") {

      // 🔴 RED: broken gustar frame
      if (/\b(gusta|gustan)\b/i.test(a) && !/\b(me|te|le|nos|os|les)\b/i.test(a)) {
        return red(
          "verb_frame",
          "Broken verb frame",
          "With gusta / gustan you need me / le / nos (me gustan…)."
        );
      }

      // Detect verbs / adjectives
      const hasVerb =
        /\b(es|está|son|soy|eres|tiene|tengo|hay|vive|juega|come|va|gusta|gustan)\b/i
          .test(a);

      const hasAdj =
        /\b(alto|alta|altos|altas|simpatico|simpática|grande|pequeño|bonito|divertido)\b/i
          .test(a);

      // 🔴 RED: adjective phrase with no verb
      if (hasAdj && !hasVerb) {
        return red(
          "missing_verb",
          "Missing verb",
          "Descriptions need a verb (es / tiene / hay…)."
        );
      }

      // 🟠 AMBER: person mismatch (noun subject + tú-verb)
      if (
        /\b(mi amigo|mi amiga|mi madre|mi padre|el chico|la chica)\b/i.test(a) &&
        /\b(tienes|eres|estás|comes|vives|juegas|vas)\b/i.test(a)
      ) {
        return amber(
          "verb_person",
          "Verb person",
          "Verb does not match the subject (mi amigo → es / tiene…)."
        );
      }

      // 🟠 AMBER: agreement
      if (/\bes\s+altos\b/i.test(a)) {
        return amber(
          "agreement",
          "Agreement",
          "Adjective must agree (es alto)."
        );
      }
    }

    // --------------------
    // GREEN fallback
    // --------------------
    result.message = "This scores. Add one more detail to improve it.";
    return result;
  }

  function red(tag, label, msg) {
    return {
      level: "red",
      focusTag: tag,
      focusLabel: label,
      message: msg,
      passed: false
    };
  }

  function amber(tag, label, msg) {
    return {
      level: "amber",
      focusTag: tag,
      focusLabel: label,
      message: msg,
      passed: true
    };
  }

  function coachSpeak(r) {
    if (r.level === "red") {
      return `Stop. Today’s focus: ${r.focusLabel}.`;
    }
    if (r.level === "amber") {
      return `This scores — but focus on ${r.focusLabel}.`;
    }
    return `Good. That scores. Next time, add one detail.`;
  }

  return { analyse, coachSpeak };
})();


