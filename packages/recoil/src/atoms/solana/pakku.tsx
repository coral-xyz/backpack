import {
  Blockchain,
  fetchPakkus,
  type SolanaNft,
  type PakkuAccount,
} from "@coral-xyz/common";
import type { ProgramAccount } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { selector } from "recoil";
import { nftMetadata } from "../nft";
import { activeSolanaWallet } from "../wallet";
import { anchorContext } from "./wallet";

export interface PakkuState extends ProgramAccount<PakkuAccount> {
  metadata: SolanaNft;
}

export const pakkus = selector<PakkuState[]>({
  key: "pakkus",
  get: async ({ get }) => {
    const provider = get(anchorContext).provider;
    const solWallet = get(activeSolanaWallet);

    if (!solWallet) {
      return [];
    }

    const nftMetadatas = get(nftMetadata);
    const metadataMints = [...nftMetadatas.values()].reduce<string[]>(
      (acc, curr: any) => {
        if (curr.blockchain === Blockchain.SOLANA) {
          return [...acc, curr.mint];
        }
        return acc;
      },
      []
    );

    const pakkus = await fetchPakkus(provider, metadataMints);

    const items: Array<any> = [];
    for await (const p of pakkus) {
      const [token] = await PublicKey.findProgramAddress(
        [
          new PublicKey(solWallet.publicKey).toBytes(),
          TOKEN_PROGRAM_ID.toBytes(),
          p.account.masterMint.toBytes(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      items.push({
        ...p,
        metadata: nftMetadatas.get(token.toBase58()),
      });
    }

    return items;
  },
});
