import { navigate } from "../router.js";
import { createPage, highlightDiff, htmlTags, fragment } from "../core.js";
import { mistakeList, resetExam } from "../state.js";

export const ResultsPage = () => {
  const { p, div, ul, li, span, br, button } = htmlTags;
  const restartButton = button("Restart exam");
  const s = (text) => span({ className: "text-xl" }, text);
  return createPage({
    content: fragment(
      p("All words have been covered."),
      ...(mistakeList.value.length > 0
        ? [
            div({ className: "list-title" }, "Your mistakes:"),
            ul(
              ...mistakeList.value.map((m) =>
                li(
                  s(`${m.eng}:`),
                  " you wrote",
                  br(),
                  s(highlightDiff(m.bul, m.answer)),
                  ", correct is",
                  br(),
                  s(m.bul),
                ),
              ),
            ),
          ]
        : []),
      restartButton,
    ),
    onConnected: () => {
      restartButton.onclick = () => {
        resetExam();
        navigate("/");
      };
    },
  });
};
