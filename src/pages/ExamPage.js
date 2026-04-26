import { navigate } from "../router.js";
import { diff, elements } from "../dom.js";
import { createPage } from "../core.js";
import {
  mistakeList,
  remainingWords,
  outcome,
  total,
  score,
  answerInputBgColor,
  currentWord,
} from "../state.js";

export default function ExamPage() {
  const { div, form, input, span } = elements;

  const Input = input({
    type: "text",
    placeholder: "Enter answer",
    className: "rounded-sm place-stretch px-0_5 items-center border-none",
    style: () => `background-color: ${answerInputBgColor.value}`,
  });

  const nextWord = () => {
    Input.value = "";
    outcome.set("");
    const next = remainingWords.value[0];
    remainingWords.set((prev) => prev.slice(1));
    currentWord.set(next);
    if (next) Input.focus();
    else navigate("/results");
  };

  const checkAnswer = () => {
    const answer = Input.value;
    if (!answer) outcome.set("");
    else if (answer.toLowerCase() === currentWord.value?.bul.toLowerCase()) {
      outcome.set("correct!");
      answerInputBgColor.set("green");
      score.set((prev) => prev + 1);
    } else {
      const message = span(
        diff(currentWord.value?.bul, answer),
        " is incorrect.",
      );
      outcome.set(message);
      answerInputBgColor.set("red");
      mistakeList.set((prev) => [...prev, { ...currentWord.value, answer }]);
    }
    setTimeout(() => {
      nextWord();
      answerInputBgColor.set("#aaa");
    }, 700);
    Input.value = answer;
    Input.focus();
  };

  return createPage({
    content: div(
      div(
        { className: "self-center text-lg text-gray pb-1 primary" },
        () => currentWord.value?.eng || "",
      ),
      div({ className: "py-1 self-center" }, "How do you write that in Bulgarian?",),
      form(
        { onsubmit: (e) => (e.preventDefault(), checkAnswer()) },
        div(Input, div({ className: "self-center mt-1" }, outcome)),
      ),
      div(
        { className: "self-center" },
        "Remaining words: ",
        span(() => remainingWords.value.length),
      ),
      div(
        { className: "self-center py-1" },
        () => `Score: ${score.value}/${total.value}`,
      ),
    ),
    onConnected: () => {
      Input.focus();
    },
  });
}
