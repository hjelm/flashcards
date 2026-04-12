import { navigate } from "../router.js";
import { diff, elements } from "../dom.js";
import { createPage } from "../core.js";
import { mistakeList, resetExam } from "../state.js";

export const ResultsPage = () => {
  const { p, div, ul, li, span, br, button } = elements;
  const spanXl = (text) => span({ className: "text-xl" }, text);
  return createPage({
    content: div(
      p("All words have been covered."),
      ...(mistakeList.value.length > 0
        ? [
            div({ className: "list-title" }, "Your mistakes:"),
            ul(
              ...mistakeList.value.map((m) =>
                li(
                  spanXl(`${m.eng}:`),
                  " you wrote",
                  br(),
                  spanXl(diff(m.bul, m.answer)),
                  ", correct is",
                  br(),
                  spanXl(m.bul),
                ),
              ),
            ),
          ]
        : []),
      button(
        {
          onClick: () => {
            resetExam();
            navigate("/");
          },
        },
        "Restart exam",
      ),
    ),
  });
};
