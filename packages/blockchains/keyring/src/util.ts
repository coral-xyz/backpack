export const DefaultKeyname = {
  defaultDerived(accountIndex: number): string {
    return `Wallet ${accountIndex + 1}`;
  },
  defaultImported(accountIndex: number): string {
    return `Imported Wallet ${accountIndex + 1}`;
  },
  defaultLedger(accountIndex: number): string {
    return `Ledger ${accountIndex + 1}`;
  },
};
