import { createPage, html, highlightDiff } from "./core.js";
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

const ListPage = () => {
  const rows = vocabularies[selectedList.value].list.map((w) => {
    const tr = document.createElement("tr");
    tr.append(html`<td>${w.bul}</td>`, html`<td>${w.eng}</td>`);
    return tr;
  });

  const content = html`
    <table style="font-size: 1rem;">
      <thead>
        <tr>
          <td style="border-bottom: solid">Bulgarian</td>
          <td style="border-bottom: solid">English</td>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  content.querySelector("tbody").append(...rows);

  return createPage({ content });
};

const ResultsPage = () => {
  const fragment = new DocumentFragment();

  fragment.append(html`<p>All words have been covered.</p>`);

  if (mistakeList.value.length > 0) {
    const items = mistakeList.value.map(
      (m) => html`
        <li>
          <span class="text-xl">${m.eng}:</span> you wrote<br />
          <span class="text-xl">${highlightDiff(m.bul, m.answer)}</span>,
          correct is<br />
          <span class="text-xl">${m.bul}</span>
        </li>
      `,
    );

    const list = html`
      <div class="list-title">Your mistakes:</div>
      <ul></ul>
    `;
    list.querySelector("ul").append(...items);
    fragment.append(list);
  }

  fragment.append(html`<button id="restartButton">Restart exam</button>`);

  const onConnected = () => {
    document.getElementById("restartButton").onclick = () => {
      resetExam();
      navigate("/");
    };
  };

  return createPage({ content: fragment, onConnected });
};

const ExamPage = () => {
  const content = html`
    <div
      id="currentWord"
      class="self-center text-lg text-gray pb-1 primary"
    ></div>
    <div class="py-1 self-center">How do you write that in Bulgarian?</div>
    <form id="answerForm">
      <div>
        <input
          type="text"
          placeholder="Enter answer"
          class="rounded-sm place-stretch px-0_5 items-center border-none"
          id="answerInput"
        />
        <div id="outcome" class="self-center mt-1"></div>
      </div>
    </form>
    <div class="self-center">
      Remaining words: <span id="remainingWords"></span>
    </div>
    <div id="score" class="self-center py-1"></div>
  `;

  let answerInput;

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
      outcome.set(
        `${highlightDiff(currentWord.value?.bul, answer)} is incorrect.`,
      );
      answerInputBgColor.set("red");
      mistakeList.set((prev) => [
        ...prev,
        { ...currentWord.value, answer: answer },
      ]);
    }
    setTimeout(() => {
      nextWord();
      answerInputBgColor.set("#aaa");
    }, 700);
    answerInput.value = answer;
    answerInput.focus();
  };

  let unsubscribe = [];

  const onConnected = () => {
    unsubscribe = [
      currentWord.subscribe((value) => {
        document.getElementById("currentWord").textContent = value?.eng || "";
      }),

      outcome.subscribe((value) => {
        document.getElementById("outcome").innerHTML = value || "";
      }),

      score.subscribe((value) => {
        document.getElementById("score").textContent =
          `Score: ${value}/${total}`;
      }),

      remainingWords.subscribe((value) => {
        document.getElementById("remainingWords").textContent = value.length;
      }),

      answerInputBgColor.subscribe((value) => {
        document.getElementById("answerInput").style.backgroundColor = value;
      }),
    ];

    document.getElementById("answerForm").onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
    answerInput = document.getElementById("answerInput");
    answerInput.focus();
  };

  const onDisconnected = () => {
    unsubscribe.forEach((fn) => fn());
  };

  return createPage({ content, onConnected, onDisconnected });
};

registerRoutes({
  "/": ExamPage,
  "/results": ResultsPage,
  "/list": ListPage,
});
initRouter();
