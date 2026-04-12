/**
 * Creates a stateful value with a subscription model for reactive updates.
 *
 * @template T
 * @param {T} initialValue - The initial value of the state.
 * @returns {{ value: T, set: (nextOrFn: T | ((prev: T) => T)) => void, subscribe: (fn: (value: T) => void) => (() => void) }}
 *
 * @example
 * const count = createState(0);
 *
 * const unsub = count.subscribe(v => console.log(v));
 *
 * count.set(5);          // logs: 5
 * count.set(n => n + 1); // logs: 6
 *
 * unsub(); // stop listening
 */
export const createState = (initialValue) => {
  let value = initialValue;
  const subscribers = new Set();

  const signal = {
    get value() {
      return value;
    },
    set(nextOrFn) {
      const next = typeof nextOrFn === "function" ? nextOrFn(value) : nextOrFn;
      if (next === value) return;
      value = next;
      for (const sub of [...subscribers]) sub(value);
    },
    subscribe(fn) {
      fn(value);
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };

  return signal;
};

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
