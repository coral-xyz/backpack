import { XNFT_PROGRAM_ID } from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";
import { selector } from "recoil";
import { bootstrap } from "../bootstrap";

export const pakkus = selector<Array<any>>({
  key: "pakkusDefault",
  get: async ({ get }) => {
    const b = get(bootstrap);
    const pakkus = await b.pakkus;
    const nftMetadatas = b.splNftMetadata;

    const items: Array<any> = [];
    for await (const p of pakkus) {
      const [token] = await PublicKey.findProgramAddress(
        [Buffer.from("token"), p.account.masterMint.toBytes()],
        XNFT_PROGRAM_ID
      );

      items.push({
        ...p,
        metadata: nftMetadatas.get(token.toString()),
      });
    }

    return items;
  },
});
