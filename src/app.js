import { initRouter, registerRoutes, navigate } from "./router.js";
import { vocabularies } from "./vocabularies.js";
import { selectedList, resetExam } from "./state.js";
import ExamPage from "./pages/ExamPage.js";
import ResultsPage from "./pages/ResultsPage.js";
import ListPage from "./pages/ListPage.js";

// Populate the vocab selector and wire up change handler
const vocabSelect = document.getElementById("vocabSelect");
vocabularies.forEach((vocab, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = vocab.name;
  vocabSelect.append(option);
});
vocabSelect.value = selectedList.value;
vocabSelect.addEventListener("change", () => {
  selectedList.set(Number(vocabSelect.value));
  resetExam();
  navigate("/");
});

registerRoutes({
  "/": ExamPage,
  "/results": ResultsPage,
  "/list": ListPage,
});
initRouter();
