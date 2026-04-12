import { navigate } from "../router.js";
import { createPage, highlightDiff, htmlTags, fragment } from "../core.js";
import {
  mistakeList,
  remainingWords,
  total,
  score,
  answerInputBgColor,
  currentWord,
  outcome,
} from "../state.js";

export const ExamPage = () => {
  const { div, form, input, span } = htmlTags;

  const currentWordEl = div({
    className: "self-center text-lg text-gray pb-1 primary",
  });
  const answerInputEl = input({
    type: "text",
    placeholder: "Enter answer",
    className: "rounded-sm place-stretch px-0_5 items-center border-none",
  });
  const outcomeEl = div({ className: "self-center mt-1" });
  const answerFormEl = form(div(answerInputEl, outcomeEl));
  const remainingWordsEl = span();
  const scoreEl = div({ className: "self-center py-1" });

  const nextWord = () => {
    answerInputEl.value = "";
    outcome.set("");
    const next = remainingWords.value[0];
    remainingWords.set((prev) => prev.slice(1));
    currentWord.set(next);
    if (next) answerInputEl.focus();
    else navigate("/results");
  };

  const checkAnswer = () => {
    const answer = answerInputEl.value;
    if (!answer) outcome.set("");
    else if (answer.toLowerCase() === currentWord.value?.bul.toLowerCase()) {
      outcome.set("correct!");
      answerInputBgColor.set("green");
      score.set((prev) => prev + 1);
    } else {
      const message = fragment(
        highlightDiff(currentWord.value?.bul, answer),
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
    answerInputEl.value = answer;
    answerInputEl.focus();
  };

  let unsubscribe = null;

  return createPage({
    content: fragment(
      currentWordEl,
      div(
        { className: "py-1 self-center" },
        "How do you write that in Bulgarian?",
      ),
      answerFormEl,
      div({ className: "self-center" }, "Remaining words: ", remainingWordsEl),
      scoreEl,
    ),
    onConnected: () => {
      unsubscribe = [
        currentWord.subscribe((value) => {
          currentWordEl.textContent = value?.eng || "";
        }),
        outcome.subscribe((value) => {
          outcomeEl.replaceChildren(value || "");
        }),
        score.subscribe(() => {
          scoreEl.textContent = `Score: ${score.value}/${total.value}`;
        }),
        total.subscribe(() => {
          scoreEl.textContent = `Score: ${score.value}/${total.value}`;
        }),
        remainingWords.subscribe((value) => {
          remainingWordsEl.textContent = value.length;
        }),
        answerInputBgColor.subscribe((value) => {
          answerInputEl.style.backgroundColor = value;
        }),
      ];
      answerFormEl.onsubmit = (e) => {
        e.preventDefault();
        checkAnswer();
      };
      answerInputEl.focus();
    },
    onDisconnected: () => {
      unsubscribe.forEach((fn) => fn());
      unsubscribe = null;
    },
  });
};
