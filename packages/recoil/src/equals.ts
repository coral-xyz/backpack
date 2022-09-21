//
// Atom and selector that support custom equality checks rather than reference
// equality only.
// See https://github.com/facebookexperimental/Recoil/issues/1416 for discussion.
//
import {
  atom,
  selector,
  AtomOptions,
  ReadOnlySelectorOptions,
  RecoilState,
  RecoilValueReadOnly,
} from "recoil";

interface EqualAtomOptions<T> extends AtomOptions<T> {
  equals: (a: T, b: T) => boolean;
}

/**
 * Use a writable selector to prevent excess renders.
 * If the setting value is equal to the current value, don't change anything.
 */
export function equalAtom<T>(options: EqualAtomOptions<T>): RecoilState<T> {
  const { key, equals, ...innerOptions } = options;
  const inner = atom({
    key: `${key}_inner`,
    ...innerOptions,
  });

  return selector({
    key,
    get: ({ get }) => get(inner),
    set: ({ get, set }, newValue) => {
      const current = get(inner);
      if (!equals(newValue as T, current)) {
        set(inner, newValue);
      }
    },
  });
}

interface EqualSelectorOptions<T>
  extends Pick<ReadOnlySelectorOptions<T>, "key" | "get"> {
  equals: (a: T, b: T) => boolean;
}

/**
 * Use a wrapper selector to prevent excess renders.
 * If the latest selection is value-equal to prior ref, return the prior ref.
 */
export function equalSelector<T>(
  options: EqualSelectorOptions<T>
): RecoilValueReadOnly<T> {
  const inner = selector({
    key: `${options.key}_inner`,
    get: options.get,
  });

  let prior: T | undefined;

  return selector({
    key: options.key,
    get: ({ get }) => {
      const latest = get(inner);
      if (prior != null && options.equals(latest, prior)) {
        return prior;
      }
      prior = latest;
      return latest as T;
    },
  });
}
