import { useState, useEffect } from "react";

type UseQueryResult<T> = {
  isFetched: boolean;
  error?: any;
  data: T | null;
};
export function useRefreshingQuery<T>(
  execute: () => Promise<T>,
  refetchTimeoutMs: number = 0
): UseQueryResult<T> {
  const [result, setResult] = useState<UseQueryResult<T>>({
    isFetched: false,
    data: null,
  });
  useEffect(() => {
    let refetchTimeout: any = null;
    setResult({
      isFetched: false,
      data: null,
    });
    const fetchQuery = () =>
      execute()
        .then((data) => {
          setResult({
            data,
            isFetched: true,
          });
        })
        .catch((e) => {
          setResult({
            data: null,
            error: e,
            isFetched: true,
          });
        })
        .finally(() => {
          if (refetchTimeoutMs > 0) {
            refetchTimeout = setTimeout(fetchQuery, refetchTimeoutMs);
          }
        });

    fetchQuery();
    return () => {
      clearTimeout(refetchTimeout);
    };
  }, [execute, refetchTimeoutMs]);
  return result;
}
