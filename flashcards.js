(() => {
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

  let answerElement;
  let outcome = "";

  let currentWord;
  const getRandomWord = () => {
    if (wordList.length === 0) {
      currentWord = undefined;
      return;
    }
    const index = Math.round(Math.random() * (wordList.length - 1));
    currentWord = { ...wordList[index] };
    wordList.splice(index, 1);
  };
  getRandomWord();

  const nextWord = () => {
    answerElement.value = "";
    outcome = "";
    getRandomWord();
    updateUI();
    if (currentWord) answerElement.focus();
  };

  const checkAnswer = () => {
    const answer = answerElement.value;
    if (!answer) outcome = "";
    else if (answer.toLowerCase() === currentWord.bul.toLowerCase()) {
      outcome = "correct!";
      score = score + 1;
    } else {
      outcome = `"${answer}" is incorrect.`;
      mistakeList.push({ ...currentWord, answer: answer });
    }
    setTimeout(() => nextWord(), 700);
    updateUI();
    answerElement.value = answer;
    answerElement.focus();
  };

  let initialLoad = true;
  function updateUI() {
    let content;
    if (!currentWord) {
      content = `
      <p>No uncompleted words exists on the list.
      Refresh your browser to start over again.</p>
      `;
      if (mistakeList)
        content += `
        <div class="list-title">Errors:</div>
        <ul>
        ${mistakeList.map((e) => `<li>"${e.answer}" correct: "${e.bul}"</li>`).join("\n")}
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
          class="rounded-sm place-stretch px-0_5 bg-gray items-center border-none"
          id="answer"
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
    document.getElementById("answerForm").onsubmit = (e) => {
      e.preventDefault();
      checkAnswer();
    };
    answerElement = document.getElementById("answer");
    if (initialLoad) {
      answerElement.focus();
    }
    initialLoad = false;
  }
  updateUI();
})();
