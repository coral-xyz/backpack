import type { TokenAccountsFilter } from "@solana/web3.js";

export function serializeTokenAccountsFilter(
  f: TokenAccountsFilter
): SerializedTokenAccountsFilter {
  // @ts-ignore
  return filter.mint
    ? { mint: filter.mint.toString() }
    : { programId: filter.programId.toString() };
}

export function deserializeTokenAccountsFilter(
  f: SerializedTokenAccountsFilter
): TokenAccountsFilter {
  // @ts-ignore
  return filter.mint
    ? { mint: new PublicKey(filter.mint) }
    : { programId: new PublicKey(filter.programId) };
}

export type SerializedTokenAccountsFilter =
  | { mint: string }
  | { programId: string };
