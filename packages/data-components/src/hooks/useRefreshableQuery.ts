import { useCallback, useState } from "react";
import type { useSuspenseQuery } from "@apollo/client";

/**
 * Custom hook to made an Apollo query refreshable with a `SectionList`.
 * @export
 * @param {ReturnType<typeof useSuspenseQuery>["refetch"]} refetch
 * @returns {{ onRefresh: () => Promise<void>, refreshing: boolean }}
 */
export function useRefreshableQuery(
  refetch: ReturnType<typeof useSuspenseQuery>["refetch"]
): { onRefresh: () => Promise<void>; refreshing: boolean } {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, setRefreshing]);

  return { onRefresh, refreshing };
}
