const wordList = [
  { bul: "дразнещ", eng: "irritating" },
  { bul: "тъкмо", eng: "just now" },
  { bul: "поздравления", eng: "congratulations" },
  { bul: "споделяне", eng: "share" },
  { bul: "скучно", eng: "bored" },
  { bul: "доволен", eng: "satisfied" },
];
const total = wordList.length;
let score = 0;
const mistakeList = [];
let answerInputBgColor = "#aaa";
let answerInput;
let outcome = "";

const getRandomWord = () => {
  if (wordList.length === 0) {
    currentWord = undefined;
    return;
  }
  const index = Math.round(Math.random() * (wordList.length - 1));
  return wordList.splice(index, 1).pop();
};

let currentWord = getRandomWord();

const nextWord = () => {
  answerInput.value = "";
  outcome = "";
  currentWord = getRandomWord();
  updateUI();
  if (currentWord) answerInput.focus();
};

const checkAnswer = () => {
  const answer = answerInput.value;
  if (!answer) outcome = "";
  else if (answer.toLowerCase() === currentWord.bul.toLowerCase()) {
    outcome = "correct!";
    answerInputBgColor = "green";
    score = score + 1;
  } else {
    outcome = `"${answer}" is incorrect.`;
    answerInputBgColor = "red";
    mistakeList.push({ ...currentWord, answer: answer });
  }
  setTimeout(() => {
    nextWord();
    answerInputBgColor = "#aaa";
    updateUI();
  }, 700);
  updateUI();
  answerInput.value = answer;
  answerInput.focus();
};

function updateUI() {
  let content;
  if (!currentWord) {
    content = `
      <p>No uncompleted words exists on the current list.<br/>
      Refresh your browser to start over again.</p>
      `;
    if (mistakeList.length > 0)
      content += `
        <div class="list-title">Your mistakes:</div>
        <ul>
        ${mistakeList.map((e) => `<li>You wrote "${e.answer}", correct is "${e.bul}"</li>`).join("\n")}
        <ul>
        `;
  } else {
    content = `
      <div class="self-center text-lg text-gray pb-1 primary">
        ${currentWord.eng || ""}
      </div>
      <div class="py-1 self-center">How do you write that in Bulgarian?</div>
      <form id="answerForm">
      <div>
        <input
          type="text"
          placeholder="Enter answer"
          class="rounded-sm place-stretch px-0_5 items-center border-none"
          style="background-color: ${answerInputBgColor}"
          id="answerInput"
        />
        <div class="self-center mt-1">${outcome}</div>
      </div>
      </form>
      <div class="self-center">
        Remaining words: ${wordList.length}
      </div>
      <div class="self-center py-1">
        Score: ${score}/${total}
      </div>
    `;
  }

  document.getElementById("app").innerHTML = content;
  const answerForm = document.getElementById("answerForm");
  if (answerForm) {
    answerForm.onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
  }
  answerInput = document.getElementById("answerInput");
  if (currentWord) {
    answerInput.focus();
  }
}
updateUI();
