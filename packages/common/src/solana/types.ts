import type { IdlAccounts, SplToken } from "@project-serum/anchor";
import type { metadata } from "@project-serum/token";
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
  account: metadata.Metadata;
};

export type SplNftMetadata = {
  publicKey: PublicKey;
  metadataAddress: PublicKey;
  metadata: metadata.Metadata;
  tokenMetaUriData: any;
};

// https://stackoverflow.com/a/72190984
type ReplaceType<Type, FromType, ToType> = Type extends FromType // FromType?
  ? ToType // Yes, replace it
  : Type extends object // Recurse?
  ? ReplaceTypes<Type, FromType, ToType> // Yes
  : Type; // No, leave it alone

type ReplaceTypes<ObjType extends object, FromType, ToType> = {
  [KeyType in keyof ObjType]: ReplaceType<ObjType[KeyType], FromType, ToType>;
};

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

// TODO(customAccountsToken)
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

// TODO(customAccountsToken)
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

export type CustomSplTokenAccountString = {
  tokenAccountsMap: [string, SolanaTokenAccountWithKeyString][];
  tokenMetadata: (TokenMetadataString | null)[];
  nftMetadata: [string, SplNftMetadataString][];
};

export type CustomSplTokenAccount = {
  tokenAccountsMap: [string, SolanaTokenAccountWithKeySerializable][];
  tokenMetadata: (TokenMetadata | null)[];
  nftMetadata: [string, SplNftMetadata][];
};

export type CustomSplTokenAccountKey = {
  tokenAccounts: SolanaTokenAccountWithKey[];
  tokenMetadata: (TokenMetadata | null)[];
  nftMetadata: [string, SplNftMetadata][];
};

export type CustomSplTokenAccountsSpl = {
  splTokenAccounts: Map<string, SolanaTokenAccountWithKeyString>;
  splTokenMetadata: (TokenMetadataString | null)[];
  splNftMetadata: Map<string, SplNftMetadataString>;
};
