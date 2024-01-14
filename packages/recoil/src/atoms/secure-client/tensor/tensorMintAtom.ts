import { Blockchain } from "@coral-xyz/common";
import { TensorClient } from "@coral-xyz/secure-clients";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import { atomFamily } from "recoil";

export const tensorMintAtom = atomFamily<
  TensorMintDataType | null,
  {
    mint: string | undefined;
    intervalMs?: number;
    blockchain: Blockchain;
    owner?: string;
  }
>({
  key: "tensorMintAtom",
  effects: ({ mint, intervalMs, blockchain, owner }) => [
    ({ setSelf, onSet }) => {
      const tensorClient = new TensorClient();
      let fetching = false;
      const refetch = async () => {
        if (!mint || !owner || blockchain !== Blockchain.SOLANA) {
          return;
        }
        fetching = true;
        tensorClient
          .fetchTensorMintData({ mint, owner })
          .then(setSelf)
          .catch((e) => {
            console.error(e);
            setSelf(null);
          })
          .then(() => {
            fetching = false;
          });
      };

      setSelf(null);
      refetch().catch((e) => {
        console.error(e);
      });

      onSet(() => {
        if (!fetching) {
          refetch().catch((e) => {
            console.error(e);
          });
        }
      });
    },
  ],
});
