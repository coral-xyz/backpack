import type { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import type { IdlAccounts, SplToken } from "@project-serum/anchor";
import type { RawMint } from "@solana/spl-token";
import type { TokenAccountsFilter } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export type SolanaTokenAccount = IdlAccounts<SplToken>["token"];

export interface SolanaTokenAccountWithKey extends SolanaTokenAccount {
  key: PublicKey;
}

export type SolanaTokenAccountWithKeySerializable = Omit<
  SolanaTokenAccountWithKey,
  "amount"
> & {
  amount: string;
};

export type TokenMetadata = {
  publicKey: PublicKey;
  account: Metadata;
};

export type SplNftMetadata = {
  publicKey: PublicKey;
  metadataAddress: PublicKey;
  metadata: Metadata;
  tokenMetaUriData: any;
};

// https://stackoverflow.com/a/72190984
type ReplaceType<Type, FromType, ToType> = Type extends FromType // FromType?
  ? ToType // Yes, replace it
  : Type extends object // Recurse?
  ? ReplaceTypes<Type, FromType, ToType> // Yes
  : Type; // No, leave it alone

export type ReplaceTypes<ObjType extends object, FromType, ToType> = {
  [KeyType in keyof ObjType]: ReplaceType<ObjType[KeyType], FromType, ToType>;
};

export type RawMintString = ReplaceTypes<RawMint, PublicKey, string>;

export type SolanaTokenAccountWithKeyString = ReplaceTypes<
  SolanaTokenAccountWithKey,
  PublicKey,
  string
>;

export type TokenMetadataString = ReplaceTypes<
  TokenMetadata,
  PublicKey,
  string
>;

export type SplNftMetadataString = ReplaceTypes<
  SplNftMetadata,
  PublicKey,
  string
>;

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
