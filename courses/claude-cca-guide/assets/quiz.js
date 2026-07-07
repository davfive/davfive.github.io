// CCA-F Teaching Workspace — shared quiz component
// Markup contract:
// <div class="quiz" data-quiz>
//   <div class="quiz-options">
//     <div class="quiz-option" data-correct="true|false">...</div>  (repeat)
//   </div>
//   <div class="quiz-feedback correct" data-feedback-correct>...</div>
//   <div class="quiz-feedback incorrect" data-feedback-incorrect>...</div>
// </div>
(function () {
  function initQuiz(quiz) {
    if (quiz.dataset.bound) return;
    quiz.dataset.bound = "true";
    var options = quiz.querySelectorAll(".quiz-option");
    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (quiz.classList.contains("answered")) return;
        quiz.classList.add("answered");
        var isCorrect = opt.getAttribute("data-correct") === "true";
        opt.classList.add(isCorrect ? "selected-correct" : "selected-incorrect");
        if (!isCorrect) {
          var correctOpt = quiz.querySelector('.quiz-option[data-correct="true"]');
          if (correctOpt) correctOpt.classList.add("reveal-correct");
        }
        var fb = quiz.querySelector(
          isCorrect ? "[data-feedback-correct]" : "[data-feedback-incorrect]"
        );
        if (fb) fb.classList.add("show");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz[data-quiz]").forEach(initQuiz);
  });
})();
