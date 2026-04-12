import { navigate } from "../router.js";
import { createPage, highlightDiff, htmlTags } from "../core.js";
import { mistakeList, resetExam } from "../state.js";

export const ResultsPage = () => {
  const { p, div, ul, li, span, br, button } = htmlTags;

  const restartButton = button("Restart exam");

  const s = (text) => span({ className: "text-xl" }, text);

  const content = new DocumentFragment();
  content.append(
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
  );

  const onConnected = () => {
    restartButton.onclick = () => {
      resetExam();
      navigate("/");
    };
  };

  return createPage({ content, onConnected });
};
