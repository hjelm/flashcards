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
