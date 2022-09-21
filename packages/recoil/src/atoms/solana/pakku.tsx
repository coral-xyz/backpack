import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { selector } from "recoil";
import { solanaBootstrap } from "../bootstrap";

export const pakkus = selector<Array<any>>({
  key: "pakkusDefault",
  get: async ({ get }) => {
    const solanaBoot = get(solanaBootstrap);
    const pakkus = await solanaBoot.pakkus;
    const nftMetadatas = solanaBoot.splNftMetadata;

    if (!solanaBoot.solActivePublicKey) {
      return [];
    }

    const items: Array<any> = [];
    for await (const p of pakkus) {
      const [token] = await PublicKey.findProgramAddress(
        [
          new PublicKey(solanaBoot.solActivePublicKey).toBytes(),
          TOKEN_PROGRAM_ID.toBytes(),
          p.account.masterMint.toBytes(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      items.push({
        ...p,
        metadata: nftMetadatas.get(token.toString()),
      });
    }

    return items;
  },
});
