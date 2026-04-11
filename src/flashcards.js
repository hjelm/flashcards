import { createEffect, createSignal } from "./signals.js";
import { html, highlightDiff } from "./html.js";

const collection = [
  {
    name: "",
    list: [
      { bul: "дразнещ", eng: "irritating" },
      { bul: "тъкмо", eng: "just now" },
      { bul: "поздравления", eng: "congratulations" },
      { bul: "споделяне", eng: "share" },
      { bul: "скучно", eng: "bored" },
      { bul: "доволен", eng: "satisfied" },
    ],
  },
];
let selectedList = 0;
const mistakeList = [];
let answerInput;
const [wordList, setWordList] = createSignal([
  ...collection[selectedList].list,
]);
const total = wordList().length;
const [score, setScore] = createSignal(0);
const [answerInputBgColor, setAnswerInputBgColor] = createSignal("#aaa");
const [currentWord, setCurrentWord] = createSignal();
const [outcome, setOutcome] = createSignal("");

const getRandomWord = () => {
  if (wordList().length === 0) {
    setCurrentWord(undefined);
    return;
  }
  const index = Math.floor(Math.random() * wordList().length);
  const randomWord = wordList()[index];
  setWordList((prev) => prev.filter((_, i) => i !== index));
  return randomWord;
};
setCurrentWord(getRandomWord());

const ListPage = () => ({
  content: html`
    <table style="font-size: 2rem;">
      <thead>
        <td style="border-bottom: solid">Bulgarian</td>
        <td style="border-bottom: solid">English</td>
      </thead>
      <tbody>
        ${collection[selectedList].list
          .map((w) => `<tr><td>${w.bul}</td><td>${w.eng}</td></tr>`)
          .join("\n")}
      </tbody>
    </table>
  `,
});

const ResultsPage = () => {
  let content = html`<p>All words have been covered.</p> `;
  if (mistakeList.length > 0)
    content.append(html`
      <div class="list-title">Your mistakes:</div>
      <ul>
        ${mistakeList
          .map(
            (m) => `
        <li><span class="text-xl">${m.eng}:</span> you wrote<br>
        <span class="text-xl">"${highlightDiff(m.bul, m.answer)}"</span>, correct is<br>
        <span class="text-xl">"${m.bul}"</span></li>`,
          )
          .join("\n")}
      </ul>
    `);
  content.append(html`<button id="restartButton">Restart exam</button>`);

  const connected = () => {
    document.getElementById("restartButton").onclick = () => {
      mistakeList.length = 0;
      setWordList([...collection[selectedList].list]);
      setScore(0);
      setOutcome("");
      setCurrentWord(getRandomWord());
      navigateToRoute("/");
    };
  };

  return { content, connected };
};

const ExamPage = () => {
  const content = html`
    <div id="currentWord" class="self-center text-lg text-gray pb-1 primary">
      ${currentWord()?.eng || ""}
    </div>
    <div class="py-1 self-center">How do you write that in Bulgarian?</div>
    <form id="answerForm">
      <div>
        <input
          type="text"
          placeholder="Enter answer"
          class="rounded-sm place-stretch px-0_5 items-center border-none"
          id="answerInput"
        />
        <div id="outcome" class="self-center mt-1">${outcome()}</div>
      </div>
    </form>
    <div class="self-center">
      Remaining words: <span id="remainingWords">${wordList().length}</span>
    </div>
    <div id="score" class="self-center py-1">Score: ${score()}/${total}</div>
  `;

  const nextWord = () => {
    answerInput.value = "";
    setOutcome("");
    setCurrentWord(getRandomWord());
    if (currentWord()) answerInput.focus();
    else navigateToRoute("/results");
  };

  const checkAnswer = () => {
    const answer = answerInput.value;
    if (!answer) setOutcome("");
    else if (answer.toLowerCase() === currentWord()?.bul.toLowerCase()) {
      setOutcome("correct!");
      setAnswerInputBgColor("green");
      setScore((prev) => prev + 1);
    } else {
      setOutcome(`${highlightDiff(currentWord()?.bul, answer)} is incorrect.`);
      setAnswerInputBgColor("red");
      mistakeList.push({ ...currentWord(), answer: answer });
    }
    setTimeout(() => {
      nextWord();
      setAnswerInputBgColor("#aaa");
    }, 700);
    answerInput.value = answer;
    answerInput.focus();
  };

  const connected = () => {
    document.getElementById("answerForm").onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
    answerInput = document.getElementById("answerInput");
    answerInput.focus();
  };

  return { content, connected };
};

createEffect(() => {
  const tag = document.getElementById("currentWord");
  if (tag) tag.textContent = currentWord()?.eng || "";
  console.log("currentWord updated", currentWord());
});

createEffect(() => {
  const tag = document.getElementById("answerInput");
  if (tag) tag.style.backgroundColor = answerInputBgColor();
  console.log("answerInputBgColor updated", answerInputBgColor());
});

createEffect(() => {
  const tag = document.getElementById("outcome");
  if (tag) tag.innerHTML = outcome() || "";
  console.log("outcome updated", outcome());
});

createEffect(() => {
  const tag = document.getElementById("remainingWords");
  if (tag) tag.textContent = wordList().length;
  console.log("wordList updated", wordList());
  console.log("remainingWords updated", wordList().length);
});

createEffect(() => {
  const tag = document.getElementById("score");
  if (tag) tag.textContent = `Score: ${score()}/${total}`;
  console.log("score updated", score());
});

const routes = {
  "/": ExamPage,
  "/results": ResultsPage,
  "/list": ListPage,
};

const renderContent = (route) => {
  const page =
    route in routes
      ? routes[route]()
      : { content: html`<h1>404 Not Found</h1>` };
  document.getElementById("app").replaceChildren(page.content);
  if (page.connected) page.connected();
};

const navigateToRoute = (route) => {
  window.history.pushState({}, "", route);
  renderContent(route);
};

const navigate = (event) => {
  event.preventDefault();
  const route = event.target.getAttribute("href");
  navigateToRoute(route);
};

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", navigate);
});

window.onpopstate = () => {
  renderContent(window.location.pathname);
};

// Initial render
renderContent(window.location.pathname);
