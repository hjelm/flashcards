let wordlist = [
  { bul: "дразнещ", eng: "irritating" },
  { bul: "тъкмо", eng: "just now" },
  { bul: "поздравления", eng: "congratulations" },
  { bul: "споделяне", eng: "share" },
  { bul: "скучно", eng: "bored" },
  { bul: "доволен", eng: "satisfied" },
];

let answerElement = document.getElementById("answer");
answerElement.focus();

let outcome = "";

let currentWord;
const getRandomWord = () => {
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

const checkAnswer = () => {
  const answer = answerElement.value;
  if (!answer) outcome = "";
  else if (answer.toLowerCase() === currentWord.bul.toLowerCase())
    outcome = "correct!";
  else outcome = `"${answer}" is incorrect`;
  updateUI();
};

let checkAnswerButton = document.getElementById("checkAnswerButton");
checkAnswerButton.disabled = true;
const updateDisabled = () => {
  if (answerElement.value.length > 0) {
    checkAnswerButton.disabled = false;
  } else {
    checkAnswerButton.disabled = true;
  }
};

function updateUI() {
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  const component = `
    <div class="self-center text-lg text-gray pb-1 primary">${currentWord.eng || ""}</div>
    <div class="py-1 self-center">How do you write that in Bulgarian?</div>
  `;
  if (main) main.innerHTML = component;
  if (footer)
    footer.innerHTML = `
      <div class="self-center">Remaining words: ${wordlist.length}<div>
      ${outcome && `<div class="self-center py-1">${outcome}</div>`}
    `;
}
updateUI();
