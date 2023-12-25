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
 * @param {number | "disabled"} intervalSeconds
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
  intervalSeconds: number | "disabled",
  ...args: Parameters<typeof useSuspenseQuery<TData, TVariables, TOptions>>
): ReturnType<
  typeof useSuspenseQuery<TData | undefined, TVariables, TOptions>
> {
  const res = useSuspenseQuery(...args);

  useEffect(() => {
    if (intervalSeconds === "disabled" || intervalSeconds <= 0) {
      return () => {};
    }

    const id = setInterval(() => {
      startTransition(() => {
        res.refetch();
      });
    }, intervalSeconds * 1000);

    return () => {
      clearInterval(id);
    };
  }, [intervalSeconds, res.refetch]);

  return res;
}
