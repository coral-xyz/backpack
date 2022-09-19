import { useEffect, useState } from "react";
import { RecoilValue, useRecoilValueLoadable } from "recoil";

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
