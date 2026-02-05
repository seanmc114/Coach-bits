// coach.js — COACH ONLY (NO LANGUAGE LOGIC)

export function coachSpeak(classifier) {

  if (classifier.verdict === "red") {
    return {
      focus: classifier.label,
      speech: `Stop. Today’s focus: ${classifier.label}.`,
      requireGym: true
    };
  }

  if (classifier.verdict === "amber") {
    return {
      focus: classifier.label,
      speech: `This scores — but focus on ${classifier.label}.`,
      requireGym: false
    };
  }

  return {
    focus: "Detail",
    speech: "Good. That scores. Add one more detail.",
    requireGym: false
  };
}
