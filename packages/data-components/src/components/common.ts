import type { ReactElement, ReactNode } from "react";
import type { SuspenseQueryHookFetchPolicy } from "@apollo/client";

export interface DataComponentScreenProps {
  fetchPolicy?: SuspenseQueryHookFetchPolicy;
  emptyStateComponent?: ReactElement;
  loaderComponent?: ReactNode;
  pollingIntervalSeconds?: number | "disabled";
}

export const DISPLAY_FORMAT = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 5,
});
