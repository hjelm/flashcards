import { createState, html, highlightDiff } from "./core.js";

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

let answerInput;
let selectedList = 0;
const mistakeList = [];
const wordList = createState([...collection[selectedList].list]);
const total = wordList.value.length;
const score = createState(0);
const answerInputBgColor = createState("#aaa");
const currentWord = createState();
const outcome = createState("");

const getRandomWord = () => {
  if (wordList.value.length === 0) {
    currentWord.set(undefined);
    return;
  }
  const index = Math.floor(Math.random() * wordList.value.length);
  const randomWord = wordList.value[index];
  wordList.set((prev) => prev.filter((_, i) => i !== index));
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

  const onConnected = () => {
    document.getElementById("restartButton").onclick = () => {
      mistakeList.length = 0;
      wordList.set([...collection[selectedList].list]);
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
      mistakeList.push({ ...currentWord.value, answer: answer });
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
      currentWord.subscribe(() => {
        document.getElementById("currentWord").textContent =
          currentWord.value?.eng || "";
      }),

      outcome.subscribe(() => {
        document.getElementById("outcome").innerHTML = outcome.value || "";
      }),

      score.subscribe(() => {
        document.getElementById("score").textContent =
          `Score: ${score.value}/${total}`;
      }),

      wordList.subscribe(() => {
        document.getElementById("remainingWords").textContent =
          wordList.value.length;
      }),

      answerInputBgColor.subscribe(() => {
        document.getElementById("answerInput").style.backgroundColor =
          answerInputBgColor.value;
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
