// CCA-F Teaching Workspace — "My Progress" panel (index.html only)
// Reads localStorage["ccaf_quiz_results"] (written by assets/quiz.js) and
// renders a per-domain summary, plus wires up download/clear buttons.
// Requires window.CCAF from quiz.js to be loaded first.
(function () {
  function domainName(n) {
    var names = {
      1: "Agentic Architecture & Orchestration",
      2: "Tool Design & MCP Integration",
      3: "Claude Code Configuration & Workflows",
      4: "Prompt Engineering & Structured Output",
      5: "Context Management & Reliability",
    };
    return names[n] || ("Domain " + n);
  }

  function render() {
    var panel = document.getElementById("results-panel");
    if (!panel || !window.CCAF) return;

    var summaryEl = document.getElementById("results-summary");
    var totalQuizzes = parseInt(panel.getAttribute("data-total-quizzes"), 10) || 0;
    var results = window.CCAF.loadResults();

    var byDomain = {};
    var correctCount = 0;
    results.forEach(function (r) {
      var d = r.domain || "?";
      byDomain[d] = byDomain[d] || { total: 0, correct: 0 };
      byDomain[d].total += 1;
      if (r.selected_correct) {
        byDomain[d].correct += 1;
        correctCount += 1;
      }
    });

    if (results.length === 0) {
      summaryEl.innerHTML = "<p>No quiz answers saved yet. Answer questions in any lesson and they'll show up here.</p>";
      return;
    }

    var rows = Object.keys(byDomain)
      .sort()
      .map(function (d) {
        var s = byDomain[d];
        var pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
        return (
          "<tr><td>Domain " + d + " — " + domainName(d) + "</td>" +
          "<td>" + s.correct + " / " + s.total + "</td>" +
          "<td>" + pct + "%</td></tr>"
        );
      })
      .join("");

    var pctTotal = results.length ? Math.round((correctCount / results.length) * 100) : 0;

    summaryEl.innerHTML =
      "<p><strong>" + results.length + " of " + totalQuizzes + "</strong> quiz questions answered &middot; " +
      "<strong>" + correctCount + "</strong> correct (" + pctTotal + "%)</p>" +
      "<table><tr><th>Domain</th><th>Correct</th><th>%</th></tr>" + rows + "</table>";
  }

  function downloadResults() {
    var panel = document.getElementById("results-panel");
    var totalQuizzes = parseInt(panel.getAttribute("data-total-quizzes"), 10) || 0;
    var results = window.CCAF.loadResults();
    var missed = results.filter(function (r) { return !r.selected_correct; });

    var byDomain = {};
    results.forEach(function (r) {
      var d = r.domain || "?";
      byDomain[d] = byDomain[d] || { total: 0, correct: 0, name: r.domain_name || "" };
      byDomain[d].total += 1;
      if (r.selected_correct) byDomain[d].correct += 1;
    });

    // Self-contained export: this whole file is the source of truth for a
    // future review, even with zero access to the original course HTML.
    // Every entry already carries its full question, all options, which one
    // was selected, and the explanation text the learner already saw.
    var envelope = {
      _meta: {
        format: "ccaf-quiz-results",
        format_version: 1,
        course: "Claude Certified Architect – Foundations (CCA-F) self-study course",
        course_structure: "5 domains, 30 official Task Statements, " + totalQuizzes + " quiz questions total",
        exported_at: new Date().toISOString(),
        questions_answered: results.length,
        questions_total: totalQuizzes,
        questions_missed: missed.length,
        domain_breakdown: byDomain,
        instructions_for_claude:
          "This file is a self-study learner's quiz results from the CCA-F course. It was exported from a " +
          "static site with no backend, so treat this JSON as the complete source of truth — do not assume " +
          "access to the original course HTML/lesson files. Each entry in `results` is fully self-contained: " +
          "`scenario` is the question asked, `options` lists all answer choices with which was correct, " +
          "`selected_text`/`selected_correct` is what the learner picked, and `correct_explanation`/" +
          "`incorrect_explanation` is the feedback they already saw on-screen (don't just repeat it verbatim). " +
          "To help this learner: focus on entries where selected_correct is false, group them by `domain`/" +
          "`domain_name`/`task_id`, identify the underlying misconception behind each miss (not just the " +
          "surface answer), and produce a short targeted review — prioritized by how many misses cluster in " +
          "one domain or one recurring theme (e.g. repeatedly confusing deterministic vs. probabilistic " +
          "enforcement, or vague vs. explicit criteria). Go a level deeper than the original explanation " +
          "rather than restating it. If a domain has zero misses, don't manufacture feedback for it.",
      },
      results: results,
    };

    var blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "ccaf-quiz-results-" + date + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearResults() {
    if (!window.confirm("Clear all saved quiz answers from this browser? This can't be undone.")) return;
    window.CCAF.saveResults([]);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var panel = document.getElementById("results-panel");
    if (!panel) return;
    render();
    var dl = document.getElementById("results-download");
    var cl = document.getElementById("results-clear");
    if (dl) dl.addEventListener("click", downloadResults);
    if (cl) cl.addEventListener("click", clearResults);
  });

  // Re-render live if the user answers a quiz in another tab/window of this
  // same site, or comes back to this tab after answering elsewhere.
  document.addEventListener("ccaf:quiz-answered", render);
  window.addEventListener("storage", function (e) {
    if (window.CCAF && e.key === window.CCAF.STORAGE_KEY) render();
  });
})();
