import type { IdlAccounts } from "@coral-xyz/anchor";
import type { splTokenProgram } from "@coral-xyz/spl-token";
import type { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import type { RawMint } from "@solana/spl-token";
import type { TokenAccountsFilter } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export type SolanaTokenAccount = IdlAccounts<
  ReturnType<typeof splTokenProgram>["idl"]
>["account"];

export type SolanaTokenAccountWithKeyAndProgramId = SolanaTokenAccount & {
  key: PublicKey;
  programId: PublicKey;
};

export type SolanaTokenAccountWithKeyandProgramIdSerializable = Omit<
  SolanaTokenAccountWithKeyAndProgramId,
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

export interface RawMintWithProgramId extends RawMint {
  programId: PublicKey;
}

export type RawMintWithProgramIdString = ReplaceTypes<
  RawMintWithProgramId,
  PublicKey,
  string
>;

export type SolanaTokenAccountWithKeyAndProgramIdString = ReplaceTypes<
  SolanaTokenAccountWithKeyAndProgramId,
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
