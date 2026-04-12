import { createPage, highlightDiff, htmlTags } from "./core.js";
import { initRouter, registerRoutes, navigate } from "./router.js";
import { vocabularies } from "./vocabularies.js";
import {
  selectedList,
  mistakeList,
  remainingWords,
  total,
  score,
  answerInputBgColor,
  currentWord,
  outcome,
  resetExam,
} from "./state.js";

// Populate the vocab selector and wire up change handler
const vocabSelect = document.getElementById("vocabSelect");
vocabularies.forEach((vocab, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = vocab.name;
  vocabSelect.append(option);
});
vocabSelect.value = selectedList.value;
vocabSelect.addEventListener("change", () => {
  selectedList.set(Number(vocabSelect.value));
  resetExam();
  navigate("/");
});

const ListPage = () => {
  const { table, thead, tbody, tr, td } = htmlTags;
  const headerCell = (text) => td({ style: "border-bottom: solid" }, text);
  return createPage({
    content: table(
      { style: "font-size: 2rem" },
      thead(tr(headerCell("Bulgarian"), headerCell("English"))),
      tbody(
        ...vocabularies[selectedList.value].list.map((w) =>
          tr(td(w.bul), td(w.eng)),
        ),
      ),
    ),
  });
};

const ResultsPage = () => {
  const { p, div, ul, li, span, br, button } = htmlTags;

  const restartButton = button("Restart exam");

  const s = (text) => span({ className: "text-xl" }, text);

  const content = new DocumentFragment();
  content.append(
    p("All words have been covered."),
    ...(mistakeList.value.length > 0
      ? [
          div({ className: "list-title" }, "Your mistakes:"),
          ul(
            ...mistakeList.value.map((m) =>
              li(
                s(`${m.eng}:`),
                " you wrote",
                br(),
                s(highlightDiff(m.bul, m.answer)),
                ", correct is",
                br(),
                s(m.bul),
              ),
            ),
          ),
        ]
      : []),
    restartButton,
  );

  const onConnected = () => {
    restartButton.onclick = () => {
      resetExam();
      navigate("/");
    };
  };

  return createPage({ content, onConnected });
};

const ExamPage = () => {
  const { div, form, input, span } = htmlTags;

  const currentWordEl = div({
    className: "self-center text-lg text-gray pb-1 primary",
  });
  const outcomeEl = div({ className: "self-center mt-1" });
  const answerInput = input({
    type: "text",
    placeholder: "Enter answer",
    className: "rounded-sm place-stretch px-0_5 items-center border-none",
  });
  const remainingWordsEl = span();
  const scoreEl = div({ className: "self-center py-1" });
  const answerForm = form(div(answerInput, outcomeEl));

  const content = new DocumentFragment();
  content.append(
    currentWordEl,
    div(
      { className: "py-1 self-center" },
      "How do you write that in Bulgarian?",
    ),
    answerForm,
    div({ className: "self-center" }, "Remaining words: ", remainingWordsEl),
    scoreEl,
  );

  const nextWord = () => {
    answerInput.value = "";
    outcome.set("");
    const next = remainingWords.value[0];
    remainingWords.set((prev) => prev.slice(1));
    currentWord.set(next);
    if (next) answerInput.focus();
    else navigate("/results");
  };

  const checkAnswer = () => {
    const answer = answerInput.value;
    if (!answer) outcome.set("");
    else if (answer.toLowerCase() === currentWord.value?.bul.toLowerCase()) {
      outcome.set("correct!");
      answerInputBgColor.set("green");
      score.set((prev) => prev + 1);
    } else {
      const fragment = new DocumentFragment();
      fragment.append(
        highlightDiff(currentWord.value?.bul, answer),
        " is incorrect.",
      );
      outcome.set(fragment);
      answerInputBgColor.set("red");
      mistakeList.set((prev) => [...prev, { ...currentWord.value, answer }]);
    }
    setTimeout(() => {
      nextWord();
      answerInputBgColor.set("#aaa");
    }, 700);
    answerInput.value = answer;
    answerInput.focus();
  };

  let unsubscribe = null;

  const onConnected = () => {
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
        answerInput.style.backgroundColor = value;
      }),
    ];
    answerForm.onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
    answerInput.focus();
  };

  const onDisconnected = () => {
    unsubscribe.forEach((fn) => fn());
    unsubscribe = null;
  };

  return createPage({ content, onConnected, onDisconnected });
};

registerRoutes({
  "/": ExamPage,
  "/results": ResultsPage,
  "/list": ListPage,
});
initRouter();
