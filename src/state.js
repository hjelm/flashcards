import { vocabularies } from "./vocabularies.js";

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

export let selectedList = 0;
export const mistakeList = createState([]);
export const remainingWords = createState([...vocabularies[selectedList].list]);
export const total = remainingWords.value.length;
export const score = createState(0);
export const answerInputBgColor = createState("#aaa");
export const currentWord = createState();
export const outcome = createState("");
