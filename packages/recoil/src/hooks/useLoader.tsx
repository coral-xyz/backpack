import { useEffect, useState } from "react";
import type { RecoilValue } from "recoil";
import { useRecoilValueLoadable } from "recoil";

/**
 * This is a hook to maintain state while recoil is updating.
 * See https://github.com/facebookexperimental/Recoil/issues/290
 * It may be possible to replace this with React 18 useTransition.
 */
export function useLoader<T>(
  loadable: RecoilValue<T>,
  defaultValue: T,
  dependencies: any[] = []
): [T, "loading" | "hasValue" | "hasError", boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const recoilValue = useRecoilValueLoadable(loadable);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setValue(defaultValue);
    setIsInitialLoad(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    if (recoilValue.state === "hasValue" && recoilValue.contents !== value) {
      setValue(recoilValue.contents);
      setIsInitialLoad(false);
    } else if (recoilValue.state === "hasError") {
      console.error(recoilValue.errorMaybe());
    }
    // no need to have recoilValue.errorMaybe in the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recoilValue.contents, recoilValue.state, value]);

  return [value, recoilValue.state, isInitialLoad];
}
