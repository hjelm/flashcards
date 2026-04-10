// --- core scheduler ---
let currentEffect = null;

// --- createSignal ---
export const createSignal = (initialValue) => {
  let value = initialValue;
  const subscribers = new Set();

  const read = () => {
    if (currentEffect) subscribers.add(currentEffect);
    return value;
  };

  const write = (nextOrFn) => {
    const next = typeof nextOrFn === "function" ? nextOrFn(value) : nextOrFn;
    if (next === value) return; // skip no-op updates
    value = next;
    for (const sub of [...subscribers]) sub();
  };

  return [read, write];
};

// --- createEffect ---
// Runs immediately, then re-runs whenever a signal it read changes
export const createEffect = (fn) => {
  const effect = () => {
    currentEffect = effect;
    try {
      fn();
    } finally {
      currentEffect = null;
    }
  };
  effect(); // initial run
};

// --- createDerived ---
// A read-only signal computed from other signals
export const createDerived = (fn) => {
  const [get, set] = createSignal(undefined);
  createEffect(() => set(fn()));
  return get;
};
