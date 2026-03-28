let wordlist = [
  { bul: "дразнещ", eng: "irritating" },
  { bul: "тъкмо", eng: "just now" },
  { bul: "поздравления", eng: "congratulations" },
  { bul: "споделяне", eng: "share" },
  { bul: "скучно", eng: "bored" },
  { bul: "доволен", eng: "satisfied" },
];

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
  answerElement.focus();
};

let checkAnswerButton;
const checkAnswer = () => {
  const answer = answerElement.value;
  if (!answer) outcome = "";
  else if (answer.toLowerCase() === currentWord.bul.toLowerCase())
    outcome = "correct!";
  else outcome = `"${answer}" is incorrect. Please try again.`;
  updateUI();
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
      <div>No uncompleted words exists on the list.
      Refresh your browser to start over again.</div>
    `;
  } else {
    content = `
    <div class="self-center text-lg text-gray pb-1 primary">${currentWord.eng || ""}</div>
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
      <button type="button" onclick="nextWord()">Next word</button>
    </div>
    <div class="self-center">Remaining words: ${wordlist.length}<div>
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
