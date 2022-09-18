import type { TokenAccountsFilter } from "@solana/web3.js";

export function serializeTokenAccountsFilter(
  filter: TokenAccountsFilter
): SerializedTokenAccountsFilter {
  // @ts-ignore
  return filter.mint
    ? // @ts-ignore
      { mint: filter.mint.toString() }
    : // @ts-ignore
      { programId: filter.programId.toString() };
}

export function deserializeTokenAccountsFilter(
  filter: SerializedTokenAccountsFilter
): TokenAccountsFilter {
  // @ts-ignore
  return filter.mint
    ? // @ts-ignore
      { mint: new PublicKey(filter.mint) }
    : // @ts-ignore
      { programId: new PublicKey(filter.programId) };
}

export type SerializedTokenAccountsFilter =
  | { mint: string }
  | { programId: string };
