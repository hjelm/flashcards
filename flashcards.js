const wordlist = [
  { bul: "дразнещ", eng: "irritating" },
  { bul: "тъкмо", eng: "just now" },
  { bul: "поздравления", eng: "congratulations" },
  { bul: "споделяне", eng: "share" },
  { bul: "скучно", eng: "bored" },
  { bul: "доволен", eng: "satisfied" },
];

const errorList = [];

const total = wordlist.length;
let score = 0;

let answerElement;
let outcome = "";

let currentWord;
const getRandomWord = () => {
  if (wordlist.length === 0) {
    currentWord = undefined;
    return;
  }
  const index = Math.round(Math.random() * (wordlist.length - 1));
  currentWord = { ...wordlist[index] };
  wordlist.splice(index, 1);
};
getRandomWord();

const nextWord = () => {
  answerElement.value = "";
  outcome = "";
  getRandomWord();
  updateUI();
  if (currentWord) answerElement.focus();
};

let checkAnswerButton;
const checkAnswer = () => {
  const answer = answerElement.value;
  if (!answer) outcome = "";
  else if (answer.toLowerCase() === currentWord.bul.toLowerCase()) {
    outcome = "correct!";
    score = score + 1;
  } else {
    outcome = `"${answer}" is incorrect.`;
    errorList.push({ ...currentWord, answer: answer });
  }
  setTimeout(() => nextWord(), 700);
  updateUI();
  answerElement.value = answer;
  answerElement.focus();
};

const updateDisabled = () => {
  if (answerElement.value.length > 0) {
    checkAnswerButton.disabled = false;
  } else {
    checkAnswerButton.disabled = true;
  }
};

let initialLoad = true;
function updateUI() {
  let content;
  if (!currentWord) {
    content = `
      <p>No uncompleted words exists on the list.
      Refresh your browser to start over again.</p>
    `;
    if (errorList)
      content += `
        <div class="list-title">Errors:</div>
        <ul>
        ${errorList.map((e) => `<li>"${e.answer}" correct: "${e.bul}"</li>`).join("\n")}
        <ul>
      `;
  } else {
    content = `
      <div class="self-center text-lg text-gray pb-1 primary">
        ${currentWord.eng || ""}
      </div>
      <div class="py-1 self-center">How do you write that in Bulgarian?</div>
      <div>
        <input
          type="text"
          class="rounded-sm place-stretch px-0_5 bg-gray items-center border-none"
          id="answer"
          onkeyup="updateDisabled()"
        />
        <div class="self-center mt-1">${outcome}</div>
      </div>
      <div class="py-1 self-center">
        <button type="button" onclick="checkAnswer()" id="checkAnswerButton">
          Check word
        </button>
      </div>
      <div class="self-center">
        Remaining words: ${wordlist.length}
      </div>
      <div class="self-center py-1">
        Score: ${score}/${total}
      </div>
    `;
  }

  document.getElementById("app").innerHTML = content;

  answerElement = document.getElementById("answer");
  checkAnswerButton = document.getElementById("checkAnswerButton");
  if (initialLoad) {
    checkAnswerButton.disabled = true;
    answerElement.focus(); //only do this on initial load.
  }
  initialLoad = false;
}
updateUI();
