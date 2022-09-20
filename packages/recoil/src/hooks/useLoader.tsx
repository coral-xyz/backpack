import { useEffect, useState } from "react";
import { RecoilValue, useRecoilValueLoadable } from "recoil";

/**
 * This is a hook to maintain state while recoil is updating.
 * See https://github.com/facebookexperimental/Recoil/issues/290
 * It may be possible to replace this with React 18 useTransition.
 */
export function useLoader<T>(
  loadable: RecoilValue<T>,
  defaultValue: T,
  dependencies: any[] = []
): [T, "loading" | "hasValue" | "hasError"] {
  const [value, setValue] = useState<T>(defaultValue);
  const recoilValue = useRecoilValueLoadable(loadable);

  useEffect(() => {
    setValue(defaultValue);
  }, dependencies);

  useEffect(() => {
    if (recoilValue.state === "hasValue" && recoilValue.contents !== value) {
      setValue(recoilValue.contents);
    }
  }, [recoilValue.contents, recoilValue.state, value]);

  return [value, recoilValue.state];
}
