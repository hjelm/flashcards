import { elements } from "../dom.js";
import { createPage } from "../core.js";
import { selectedList } from "../state.js";
import { vocabularies } from "../vocabularies.js";

export default function ListPage() {
  const { table, thead, tbody, tr, td } = elements;
  const headerCell = (text) => td({ style: "border-bottom: solid" }, text);
  return createPage({
    content: table(
      { style: "font-size: 2rem" },
      thead(tr(headerCell("Bulgarian"), headerCell("English"))),
      tbody(
        ...vocabularies[selectedList.value].list.map((w) =>
          tr(td(w.bul), td(w.eng)),
        ),
      ),
    ),
  });
}
