// CCA-F Teaching Workspace — shared quiz component
// Markup contract:
// <div class="quiz" data-quiz>
//   <div class="quiz-scenario">...</div>
//   <div class="quiz-options">
//     <div class="quiz-option" data-correct="true|false"><span class="text">...</span></div>  (repeat)
//   </div>
//   <div class="quiz-feedback correct" data-feedback-correct><span class="fb-text">...</span></div>
//   <div class="quiz-feedback incorrect" data-feedback-incorrect><span class="fb-text">...</span></div>
// </div>
//
// Results storage contract (shared with assets/results.js):
// localStorage["ccaf_quiz_results"] = JSON array of self-contained entries:
//   { lesson_file, domain, domain_name, task_id, lesson_title, quiz_index,
//     scenario, options: [{text, correct}], selected_text, selected_correct,
//     correct_text, correct_explanation, incorrect_explanation, answered_at }
// Each entry carries the full question, not just the answer — so the export
// stands on its own even without the original course files. Answers are
// stored ONLY in the browser's localStorage; nothing is sent anywhere.
// Retaking a quiz overwrites that quiz's prior entry rather than duplicating.
(function () {
  var STORAGE_KEY = "ccaf_quiz_results";

  var DOMAIN_NAMES = {
    1: "Agentic Architecture & Orchestration",
    2: "Tool Design & MCP Integration",
    3: "Claude Code Configuration & Workflows",
    4: "Prompt Engineering & Structured Output",
    5: "Context Management & Reliability",
  };

  function loadResults() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveResults(results) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      // Storage unavailable (private browsing, quota, disabled) — fail silently.
      // The quiz UI itself still works without persistence.
    }
  }

  function recordResult(entry) {
    var results = loadResults();
    var id = entry.lesson_file + "#" + entry.quiz_index;
    var idx = -1;
    for (var i = 0; i < results.length; i++) {
      if (results[i].lesson_file + "#" + results[i].quiz_index === id) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      results[idx] = entry;
    } else {
      results.push(entry);
    }
    saveResults(results);
  }

  function pageMeta() {
    var b = document.body;
    var domain = b.getAttribute("data-domain") || "";
    return {
      lesson_file: b.getAttribute("data-lesson-file") || "",
      domain: domain,
      domain_name: DOMAIN_NAMES[domain] || "",
      task_id: b.getAttribute("data-task-id") || "",
      lesson_title: b.getAttribute("data-lesson-title") || document.title,
    };
  }

  function textOf(el) {
    return el ? el.textContent.trim() : "";
  }

  function initQuiz(quiz, quizIndex) {
    if (quiz.dataset.bound) return;
    quiz.dataset.bound = "true";
    var options = quiz.querySelectorAll(".quiz-option");
    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (quiz.classList.contains("answered")) return;
        quiz.classList.add("answered");
        var isCorrect = opt.getAttribute("data-correct") === "true";
        opt.classList.add(isCorrect ? "selected-correct" : "selected-incorrect");
        var correctOpt = quiz.querySelector('.quiz-option[data-correct="true"]');
        if (!isCorrect && correctOpt) {
          correctOpt.classList.add("reveal-correct");
        }
        var fbCorrectEl = quiz.querySelector("[data-feedback-correct]");
        var fbIncorrectEl = quiz.querySelector("[data-feedback-incorrect]");
        var fb = isCorrect ? fbCorrectEl : fbIncorrectEl;
        if (fb) fb.classList.add("show");

        var allOptions = [];
        options.forEach(function (o) {
          allOptions.push({
            text: textOf(o.querySelector(".text")),
            correct: o.getAttribute("data-correct") === "true",
          });
        });

        var meta = pageMeta();

        recordResult({
          lesson_file: meta.lesson_file,
          domain: meta.domain,
          domain_name: meta.domain_name,
          task_id: meta.task_id,
          lesson_title: meta.lesson_title,
          quiz_index: quizIndex,
          scenario: textOf(quiz.querySelector(".quiz-scenario")),
          options: allOptions,
          selected_text: textOf(opt.querySelector(".text")),
          selected_correct: isCorrect,
          correct_text: textOf(correctOpt ? correctOpt.querySelector(".text") : null),
          correct_explanation: textOf(fbCorrectEl ? fbCorrectEl.querySelector(".fb-text") : null),
          incorrect_explanation: textOf(fbIncorrectEl ? fbIncorrectEl.querySelector(".fb-text") : null),
          answered_at: new Date().toISOString(),
        });

        document.dispatchEvent(new CustomEvent("ccaf:quiz-answered"));
      });
    });
  }

  // Exposed for assets/results.js (the "My Progress" panel on index.html)
  window.CCAF = window.CCAF || {};
  window.CCAF.STORAGE_KEY = STORAGE_KEY;
  window.CCAF.DOMAIN_NAMES = DOMAIN_NAMES;
  window.CCAF.loadResults = loadResults;
  window.CCAF.saveResults = saveResults;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz[data-quiz]").forEach(initQuiz);
  });
})();
