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
 * Tagged template literal that parses an HTML string into a DocumentFragment,
 * safely interpolating strings, Nodes, and DocumentFragments.
 *
 * @example
 * const name = "World";
 * const node = html`<h1>Hello, ${name}!</h1>`;
 *
 * const child = html`<strong>bold</strong>`;
 * const parent = html`<p>This is ${child}!</p>`;
 *
 * @param {TemplateStringsArray} strings
 * @param {...(string | number | Node | DocumentFragment)} values
 * @returns {DocumentFragment}
 */
export function html(strings, ...values) {
  const fragment = new DocumentFragment();

  strings.forEach((string, i) => {
    fragment.append(document.createRange().createContextualFragment(string));

    if (i < values.length) {
      const value = values[i];
      if (value instanceof Node) {
        fragment.append(value);
      } else {
        fragment.append(document.createTextNode(String(value ?? "")));
      }
    }
  });

  return fragment;
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
 * @returns {DocumentFragment}
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

  const fragment = new DocumentFragment();
  [...input].forEach((char, k) => {
    if (matchedInInput.has(k)) {
      fragment.append(document.createTextNode(char));
    } else {
      const span = document.createElement("span");
      span.style.color = "red";
      span.textContent = char;
      fragment.append(span);
    }
  });

  return fragment;
};

/**
 * Returns a new array with elements in random order (Fisher-Yates shuffle).
 *
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]}
 */
export const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const element = (tag, attrsOrChild, ...rest) => {
  const hasAttrs =
    attrsOrChild !== null &&
    typeof attrsOrChild === "object" &&
    !(attrsOrChild instanceof Node);
  const attrs = hasAttrs ? attrsOrChild : {};
  const children = hasAttrs ? rest : [attrsOrChild, ...rest];
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node[k] = v;
  node.append(...children);
  return node;
};

export const htmlTags = new Proxy(
  {},
  {
    get:
      (_, tag) =>
      (...args) =>
        element(tag, ...args),
  },
);
