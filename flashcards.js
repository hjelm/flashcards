let wordlist = [
  { bul: "дразнещ", eng: "irritating" },
  { bul: "тъкмо", eng: "just now" },
  { bul: "поздравления", eng: "congratulations" },
  { bul: "споделяне", eng: "share" },
  { bul: "скучно", eng: "bored" },
  { bul: "доволен", eng: "satisfied" },
];

const main = document.getElementById("main");
const checkAnswerButton = document.getElementById("checkAnswerButton");
const answerElement = document.getElementById("answer");
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
  getRandomWord();
  updateUI();
};

const checkAnswer = () => {
  const answer = answerElement.value;
  if (!answer) outcome = "";
  else if (answer.toLowerCase() === currentWord.bul.toLowerCase())
    outcome = "correct!";
  else outcome = `${answer} is incorrect`;
  updateUI();
};

checkAnswerButton.disabled = true;
const updateDisabled = () => {
  if (answerElement.value.length > 0) {
    checkAnswerButton.disabled = false;
  } else {
    checkAnswerButton.disabled = true;
  }
};

function updateUI() {
  const component = `
    <div>Remaining words: ${wordlist.length}
    <div>Current word: <span style="color: #aaa; font-size: 40px;">${currentWord.eng || ""}</span></div>
    <div>${outcome}</div>
    <div>How do you write that in Bulgarian?</div>
  `;

  if (main) main.innerHTML = component;
  else console.log("#main is not loaded");
}
updateUI();
