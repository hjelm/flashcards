import { html, highlightDiff } from "./core.js";
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
} from "./state.js";

const getRandomWord = () => {
  if (remainingWords.value.length === 0) {
    currentWord.set(undefined);
    return;
  }
  const index = Math.floor(Math.random() * remainingWords.value.length);
  const randomWord = remainingWords.value[index];
  remainingWords.set((prev) => prev.filter((_, i) => i !== index));
  return randomWord;
};
currentWord.set(getRandomWord());

const ListPage = () => ({
  content: html`
    <table style="font-size: 2rem;">
      <thead>
        <td style="border-bottom: solid">Bulgarian</td>
        <td style="border-bottom: solid">English</td>
      </thead>
      <tbody>
        ${vocabularies[selectedList].list
          .map((w) => `<tr><td>${w.bul}</td><td>${w.eng}</td></tr>`)
          .join("\n")}
      </tbody>
    </table>
  `,
});

const ResultsPage = () => {
  let content = html`<p>All words have been covered.</p> `;
  if (mistakeList.value.length > 0)
    content.append(html`
      <div class="list-title">Your mistakes:</div>
      <ul>
        ${mistakeList.value
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

  const onConnected = () => {
    document.getElementById("restartButton").onclick = () => {
      mistakeList.value.length = 0;
      remainingWords.set([...vocabularies[selectedList].list]);
      score.set(0);
      outcome.set("");
      currentWord.set(getRandomWord());
      navigateToRoute("/");
    };
  };

  return { content, onConnected };
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
    currentWord.set(getRandomWord());
    if (currentWord.value) answerInput.focus();
    else navigateToRoute("/results");
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

  return { content, onConnected, onDisconnected };
};

const routes = {
  "/": ExamPage,
  "/results": ResultsPage,
  "/list": ListPage,
};

let currentPage;
const renderContent = (route) => {
  if (currentPage?.onDisconnected) currentPage.onDisconnected();
  currentPage =
    route in routes
      ? routes[route]()
      : { content: html`<h1>404 Not Found</h1>` };
  document.getElementById("app").replaceChildren(currentPage.content);
  if (currentPage?.onConnected) currentPage.onConnected();
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
