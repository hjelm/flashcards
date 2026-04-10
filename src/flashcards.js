import "./style.css";
import { createEffect, createSignal } from "./signals.js";

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
const wordList = [...collection[selectedList].list];
const total = wordList.length;
let score = 0;
const mistakeList = [];
let answerInput;
let hash = location.hash.replace("#", "") || "exam";
const [answerInputBgColor, setAnswerInputBgColor] = createSignal("#aaa");
const [currentWord, setCurrentWord] = createSignal();
const [outcome, setOutcome] = createSignal("");
document.setAnswerInputBgColor = setAnswerInputBgColor;
document.setCurrentWord = setCurrentWord;
document.setOutcome = setOutcome;

const getRandomWord = () => {
  if (wordList.length === 0) {
    setCurrentWord(undefined);
    return;
  }
  const index = Math.round(Math.random() * (wordList.length - 1));
  return wordList.splice(index, 1).pop();
};
setCurrentWord(getRandomWord());

const nextWord = () => {
  answerInput.value = "";
  setOutcome("");
  setCurrentWord(getRandomWord());
  if (currentWord()) answerInput.focus();
};

const checkAnswer = () => {
  const answer = answerInput.value;
  if (!answer) setOutcome("");
  else if (answer.toLowerCase() === currentWord().bul.toLowerCase()) {
    setOutcome("correct!");
    setAnswerInputBgColor("green");
    score = score + 1;
  } else {
    setOutcome(`"${answer}" is incorrect.`);
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

const diffAnswer = (answer, target) => {
  let ok = "";
  let bad = "";
  for (i in answer) {
    if (answer[i] === target[i]) ok += answer[i];
    else {
      bad = answer.substring(i + 1);
      break;
    }
  }
  return `<span class="ok">${ok}</span><span class="bad">${bad}</span>`;
};

navigation.onnavigate = (e) => {
  hash = new URLPattern(e.destination.url).hash;
  updateUI();
};
location.onnavigate = (e) => {
  console.log(e);
};

function html(strings, ...values) {
  const template = document.createElement("template");
  template.innerHTML = String.raw(strings, ...values);
  return template.content;
}

function updateUI() {
  let content;
  document.getElementById("listLink").style.textDecoration = "unset";
  document.getElementById("examLink").style.textDecoration = "underline";
  if (hash === "list") {
    content = html`
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
    `;
    document.getElementById("listLink").style.textDecoration = "underline";
    document.getElementById("examLink").style.textDecoration = "unset";
  } else if (!currentWord()) {
    content = html` <p>All words have been covered.</p> `;
    if (mistakeList.length > 0)
      content.append(html`
        <div class="list-title">Your mistakes:</div>
        <ul>
          ${mistakeList
            .map(
              (m) => `
          <li><span class="text-xl">${m.eng}:</span> you wrote<br>
          <span class="text-xl">"${m.answer}"</span>, correct is<br>
          <span class="text-xl">"${m.bul}"</span></li>`,
            )
            .join("\n")}
        </ul>
        <p>Refresh your browser to start over again.</p>
      `);
  } else {
    content = html`
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
      <div class="self-center">Remaining words: ${wordList.length}</div>
      <div class="self-center py-1">Score: ${score}/${total}</div>
    `;
  }
  document.getElementById("app").replaceChildren(content);

  const answerForm = document.getElementById("answerForm");
  if (answerForm) {
    answerForm.onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
  }
  answerInput = document.getElementById("answerInput");
  if (currentWord() && answerInput) {
    answerInput.focus();
  }
}
updateUI();

createEffect(() => {
  const tag = document.getElementById("currentWord");
  if (tag) tag.textContent = currentWord()?.eng || "";
  console.log("currentWord updated", currentWord());
});
createEffect(() => {
  const tag = document.getElementById("outcome");
  if (tag) tag.textContent = outcome() || "";
  console.log("outcome updated", outcome());
});
createEffect(() => {
  const tag = document.getElementById("answerInput");
  if (tag) tag.style.backgroundColor = answerInputBgColor();
  console.log("answerInputBgColor updated", answerInputBgColor());
});
