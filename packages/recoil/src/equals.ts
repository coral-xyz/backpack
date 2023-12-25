//
// Atom and selector that support custom equality checks rather than reference
// equality only.
// See https://github.com/facebookexperimental/Recoil/issues/1416 for discussion.
//

import type {
  AtomFamilyOptions,
  AtomOptions,
  ReadOnlySelectorFamilyOptions,
  ReadOnlySelectorOptions,
  RecoilState,
  RecoilValueReadOnly,
  SerializableParam,
} from "recoil";
import { atom, atomFamily, selector, selectorFamily } from "recoil";

type EqualAtomOptions<T> = AtomOptions<T> & {
  equals: (a: T, b: T) => boolean;
};

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

type EqualAtomFamilyOptions<T, K extends SerializableParam> = AtomFamilyOptions<
  T,
  K
> & {
  equals: (a: T, b: T) => boolean;
};

/**
 * Use a writable selector to prevent excess renders.
 * If the setting value is equal to the current value, don't change anything.
 */
export function equalAtomFamily<T, K extends SerializableParam>(
  options: EqualAtomFamilyOptions<T, K>
): (key: K) => RecoilState<T> {
  const { key, equals, ...innerOptions } = options;
  const inner = atomFamily({
    key: `${key}_inner`,
    ...innerOptions,
  });

  return selectorFamily({
    key,
    get:
      (key) =>
      ({ get }) =>
        get(inner(key)),
    set:
      (key) =>
      ({ get, set }, newValue) => {
        const current = get(inner(key));
        if (!equals(newValue as T, current)) {
          set(inner(key), newValue);
        }
      },
  });
}

interface EqualSelectorFamilyOptions<T, K extends SerializableParam>
  extends Pick<ReadOnlySelectorFamilyOptions<T, K>, "key" | "get"> {
  equals: (a: T, b: T) => boolean;
}

/**
 * Use a wrapper selector to prevent excess renders.
 * If the latest selection is value-equal to prior ref, return the prior ref.
 */
export function equalSelectorFamily<T, K extends SerializableParam>(
  options: EqualSelectorFamilyOptions<T, K>
): (key: K) => RecoilValueReadOnly<T> {
  const inner = selectorFamily({
    key: `${options.key}_inner`,
    get: options.get,
  });

  let prior: T | undefined;

  return selectorFamily({
    key: options.key,
    get:
      (key) =>
      ({ get }) => {
        const latest = get(inner(key));
        if (prior != null && options.equals(latest, prior)) {
          return prior;
        }
        prior = latest;
        return latest as T;
      },
  });
}
