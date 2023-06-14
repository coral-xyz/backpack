import { useEffect, useMemo, useState } from "react";

// adapted from https://usehooks.com/useAsync/ but simplified
// above link contains example on how to add delayed execution if ever needed
export function useAsyncData<T>(asyncCallback: () => Promise<T> | undefined): {
  isLoading: boolean;
  data: T | undefined;
} {
  const [data, setData] = useState<{
    res: T | undefined;
    input: () => Promise<T> | undefined;
  }>({
    res: undefined,
    input: asyncCallback,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    async function runCallback(): Promise<void> {
      const res = await asyncCallback();
      setIsLoading(false);
      setData({
        res,
        input: asyncCallback,
      });
    }

    runCallback();
  }, [asyncCallback]);

  return useMemo(() => {
    if (asyncCallback !== data.input) {
      return { isLoading: true, data: undefined };
    }

    return { isLoading, data: data.res };
  }, [asyncCallback, isLoading, data]);
}
