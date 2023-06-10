import { startTransition, useEffect } from "react";
import {
  type OperationVariables,
  type SuspenseQueryHookOptions,
  useSuspenseQuery,
} from "@apollo/client";

/**
 * Wrapper hook around the Apollo client `useSuspenseQuery` to add intervalled
 * polling of new data based on the argued interval length in milliseconds.
 * @export
 * @template TData
 * @template TVariables
 * @template TOptions
 * @param {number} interval
 * @param {...Parameters<typeof useSuspenseQuery} args
 */
export function usePolledSuspenseQuery<
  TData,
  TVariables extends OperationVariables,
  TOptions extends Omit<
    SuspenseQueryHookOptions<TData, OperationVariables>,
    "variables"
  >
>(
  interval: number,
  ...args: Parameters<typeof useSuspenseQuery<TData, TVariables, TOptions>>
): ReturnType<typeof useSuspenseQuery<TData, TVariables, TOptions>> {
  const res = useSuspenseQuery(...args);

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => {
        res.refetch();
      });
    }, interval);

    return () => {
      clearInterval(id);
    };
  }, [interval, res.refetch]);

  return res;
}
