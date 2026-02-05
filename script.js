const $ = id => document.getElementById(id);

$("runBtn").onclick = () => {
  const payload = {
    prompt: $("prompt").value,
    answer: $("answer").value,
    lang: $("lang").value
  };

  let result;
  try {
    result = Coach.analyse(payload);
  } catch (e) {
    result = {
      focusLabel: "Fallback",
      message: "Coach unavailable.",
      passed: false
    };
  }

  const out = $("out");
  out.classList.remove("hidden");
  out.innerHTML = `
    <div class="k">Coach verdict</div>
    <div class="v">${Coach.coachSpeak(result)}</div>
    <div class="k">Why</div>
    <div>${result.message}</div>
  `;
};

