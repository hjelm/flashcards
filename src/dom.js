import { track } from "./state.js";

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
 * diff('necessary', 'neccesary');
 * // returns: "ne<span style="color:red">cc</span>e<span style="color:red">s</span>ary"
 *
 * @param {string} original - The reference string to compare against.
 * @param {string} input - The string to highlight differences in.
 * @returns {DocumentFragment}
 */
export const diff = (original, input) => {
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
 * Resolves a child value for appending to the DOM. If the child is a
 * function, inserts a Text node initially and reactively updates it
 * (or swaps the element) whenever its dependencies change.
 *
 * @param {Child | (() => Child)} child
 * @returns {Node}
 */
const resolveChild = (child) => {
  if (typeof child !== "function") return child;

  let node = toNode(child());

  track(
    () => {
      const newNode = toNode(child());
      node.replaceWith(newNode);
      node = newNode;
    },
    {
      get isConnected() {
        return node.isConnected;
      },
    },
  );

  return node;
};

// Small helper to coerce a value to a Node
const toNode = (value) =>
  value instanceof Node ? value : document.createTextNode(String(value ?? ""));

/**
 * @typedef {string | number | Node | null | undefined} Child
 */

/**
 * @typedef {Record<string, unknown>} Attrs
 */

/**
 * Creates a `DocumentFragment` containing the given children.
 *
 * Accepts the same child types as `htmlTags` factory functions — strings,
 * numbers, and Nodes — so it composes with them naturally. Useful when you
 * need to group siblings without introducing a wrapper element.
 *
 * @example
 * // Group siblings with no wrapper element
 * parent.append(
 *   fragment(
 *     span("Hello"),
 *     span("World"),
 *   )
 * );
 *
 * @example
 * // Conditionally render a block
 * const { div, p } = htmlTags;
 * div(
 *   p("Always visible"),
 *   isLoggedIn ? fragment(p("Welcome back!"), logoutButton) : loginButton,
 * );
 *
 * @param {...Child} children
 * @returns {DocumentFragment}
 */
export const fragment = (...children) => {
  const f = new DocumentFragment();
  f.append(...children.filter((c) => c != null).map(resolveChild));
  return f;
};

/**
 * Creates a DOM element with optional attributes and children.
 *
 * @param {string} tag - The HTML tag name.
 * @param {Attrs | Child} [attrsOrChild] - Either an attributes object or the first child.
 * @param {...Child} rest - Remaining children.
 * @returns {HTMLElement}
 */
const element = (tag, attrsOrChild, ...rest) => {
  const hasAttrs =
    attrsOrChild !== null &&
    typeof attrsOrChild === "object" &&
    !(attrsOrChild instanceof Node);
  const attrs = hasAttrs ? attrsOrChild : {};
  const children = hasAttrs ? rest : [attrsOrChild, ...rest];
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "function")
      track(() => {
        node[k] = v();
      });
    else node[k] = v;
  }
  node.append(...children.map(resolveChild));
  return node;
};

/**
 * A proxy object that exposes every HTML tag as a factory function.
 * Each factory accepts an optional attributes object followed by any
 * number of children (strings, numbers, or Nodes), and returns the
 * corresponding `HTMLElement`.
 *
 * Attribute keys are assigned directly as DOM properties, so use
 * camelCase where appropriate (e.g. `className`, `textContent`).
 *
 * @example
 * const { div, p, button } = htmlTags;
 *
 * // Element with text content
 * div("Hello world");
 *
 * // Element with attributes
 * button({ className: "btn", disabled: true }, "Click me");
 *
 * // Nested elements
 * div({ className: "card" },
 *   p("First paragraph"),
 *   p("Second paragraph"),
 * );
 *
 * @type {Record<string, (attrsOrChild?: Attrs | Child, ...children: Child[]) => HTMLElement>}
 */
export const elements = new Proxy(
  {},
  {
    get:
      (_, tag) =>
      (...args) =>
        element(tag, ...args),
  },
);
