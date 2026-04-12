/**
 * Creates a page object with a rendered content fragment and optional lifecycle hooks.
 *
 * @param {object} options
 * @param {() => DocumentFragment} options.render - Returns the page's DOM content.
 * @param {() => void} [options.onConnected] - Called after the page is mounted to the DOM.
 * @param {() => void} [options.onDisconnected] - Called before the page is unmounted from the DOM.
 * @returns {{ content: DocumentFragment, onConnected?: () => void, onDisconnected?: () => void }}
 */
export const createPage = ({ content, onConnected, onDisconnected }) => ({
  content,
  onConnected,
  onDisconnected,
});

/**
 * Tagged template literal that parses an HTML string into a DocumentFragment.
 *
 * @example
 * node.innerHtml = html`<h1>Hello, ${name}!</h1>`;
 *
 * @param {TemplateStringsArray} strings - The static string parts of the template literal.
 * @param {...unknown} values - The interpolated values.
 * @returns {DocumentFragment}
 */
export function html(strings, ...values) {
  const template = document.createElement("template");
  template.innerHTML = String.raw(strings, ...values);
  return template.content;
}

/**
 * Compares two strings and returns a DocumentFragment where characters in
 * `input` that don't match `original` are wrapped in a red `<span>`.
 *
 * Uses a Longest Common Subsequence (LCS) algorithm to detect insertions,
 * deletions, and substitutions, so correct characters are never falsely flagged.
 *
 * @example
 * highlightDiff('necessary', 'neccesary');
 * // returns: "ne<span style="color:red">cc</span>e<span style="color:red">s</span>ary"
 *
 * @param {string} original - The reference string to compare against.
 * @param {string} input - The string to highlight differences in.
 * @returns {string}
 */
export const highlightDiff = (original, input) => {
  const m = original.length,
    n = input.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        original[i - 1] === input[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const matchedInInput = new Set();
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (original[i - 1] === input[j - 1]) {
      matchedInInput.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return [...input]
    .map((char, k) =>
      matchedInInput.has(k) ? char : `<span style="color:red">${char}</span>`,
    )
    .join("");
};
