export type TransactionOverrides = {
  computeUnits: string;
  priorityFee: string;
  downgradedWritableAccounts: string[];
  disableFeeConfig: boolean;
  disableDowngradeAccounts: boolean;
};
