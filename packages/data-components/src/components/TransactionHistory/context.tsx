import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { ParseTransactionDetails } from "./parsing";
import type { ResponseTransaction } from "./utils";

export type TransactionsContextType = {
  onItemClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
  ) => void | Promise<void>;
};

const defaultValue: TransactionsContextType = {
  onItemClick: (_t, _e, _p) => {},
};

const TransactionsContext =
  createContext<TransactionsContextType>(defaultValue);

export function useTransactionsContext(): TransactionsContextType {
  return useContext(TransactionsContext);
}

export function TransactionsProvider({
  children,
  ...rest
}: PropsWithChildren<TransactionsContextType>) {
  return (
    <TransactionsContext.Provider value={rest}>
      {children}
    </TransactionsContext.Provider>
  );
}
